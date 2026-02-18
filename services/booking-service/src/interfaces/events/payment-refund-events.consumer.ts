import { Logger, rabbitAssertTopology, rabbitConsumeWithRetry } from '@travel-web/shared';
import { prismaUnitOfWork } from '../../infrastructure/prisma/prisma-unit-of-work';
import { createPrismaBookingRepository } from '../../infrastructure/prisma/prisma-booking-repository';
import { prismaIdempotencyStore } from '../../infrastructure/idempotency/prisma-idempotency-store';
import { applyPaymentRefundEvent } from '../../application/usecases/apply-payment-refund-event';
import {
    bookingRabbitConsumeDurationSeconds,
    bookingRabbitConsumeTotal,
    bookingRabbitRetryReceivedTotal,
    bookingLifecycleDurationSeconds,
    bookingRabbitRetryScheduledTotal,
} from '../../lib/metrics';

const logger = new Logger('PaymentRefundEventsConsumer');

type PaymentRefundFailed = {
    type: 'PaymentRefundFailed';
    data: { bookingId: string; reason: string };
};

type PaymentRefunded = {
    type: 'PaymentRefunded';
    data: { bookingId: string };
};

function getEventType(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const p = payload as Record<string, unknown>;
    return typeof p.type === 'string' ? p.type : undefined;
}

function getBookingId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : undefined;
    const fromData = data && typeof data.bookingId === 'string' ? data.bookingId : undefined;
    const fromTop = typeof p.bookingId === 'string' ? p.bookingId : undefined;
    return fromData || fromTop;
}

function isRefunded(payload: unknown): payload is PaymentRefunded {
    return getEventType(payload) === 'PaymentRefunded' && typeof getBookingId(payload) === 'string';
}

function isRefundFailed(payload: unknown): payload is PaymentRefundFailed {
    if (getEventType(payload) !== 'PaymentRefundFailed') return false;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : undefined;
    return typeof data?.bookingId === 'string' && typeof data?.reason === 'string';
}

export async function startPaymentRefundEventsConsumer() {
    if (process.env.ENABLE_PAYMENT_REFUND_EVENTS_CONSUMER !== 'true') {
        logger.warn('ENABLE_PAYMENT_REFUND_EVENTS_CONSUMER is not true; skipping refund events consumer');
        return;
    }
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping refund events consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is not set');

    const queue = process.env.RABBITMQ_QUEUE_PAYMENT_REFUND_EVENTS || 'booking-service.payment-refund-events';
    const exchange = process.env.RABBITMQ_EXCHANGE || 'events';
    const dlx = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';

    await rabbitAssertTopology({
        exchange: { name: exchange, type: 'topic' },
        dlx: { exchange: { name: dlx, type: 'topic' } },
        queues: [
            {
                name: queue,
                options: {
                    durable: true,
                    arguments: {
                        'x-dead-letter-exchange': dlx,
                        'x-dead-letter-routing-key': `${queue}.dlq`,
                    },
                },
                bindings: [
                    { exchange, routingKey: 'payment.paymentrefunded' },
                    { exchange, routingKey: 'payment.refund.failed' },
                ],
            },
            {
                name: `${queue}.dlq`,
                options: { durable: true },
                bindings: [{ exchange: dlx, routingKey: `${queue}.dlq` }],
            },
        ],
        retry: {
            exchange: { name: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', type: 'topic' },
            queues: [
                {
                    name: `${queue}.retry.5000`,
                    ttlMs: 5000,
                    deadLetterExchange: exchange,
                    // Note: retry DLX routing key is fixed per retry queue; payload type carries the true event type.
                    deadLetterRoutingKey: 'payment.paymentrefunded',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.5000` }],
                },
                {
                    name: `${queue}.retry.30000`,
                    ttlMs: 30000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'payment.paymentrefunded',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.30000` }],
                },
                {
                    name: `${queue}.retry.300000`,
                    ttlMs: 300000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'payment.paymentrefunded',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.300000` }],
                },
            ],
        },
    });

    const bookingsRepo = createPrismaBookingRepository();

    await rabbitConsumeWithRetry(
        {
            queue,
            bindingKeys: ['payment.paymentrefunded', 'payment.refund.failed'],
            prefetch: 20,
            consumerTag: 'booking-service/payment-refund-events',
            enableRetry: true,
            maxRetries: 3,
            retryDelaysMs: [5000, 30000, 300000],
            onRetryScheduled: ({ queue, routingKey, delayMs, nextRetry }) => {
                bookingRabbitRetryScheduledTotal.inc({
                    queue,
                    routingKey,
                    eventType: 'payment.refund.events',
                    delayMs: String(delayMs),
                    nextRetry: String(nextRetry),
                });
            },
        },
        async (payload, raw) => {
            const routingKey = raw.fields.routingKey;
            const messageId = raw.properties.messageId;
            const eventType = getEventType(payload) || 'Unknown';
            const bookingId = getBookingId(payload);
            if (!bookingId) return;

            const headers = raw.properties.headers as Record<string, unknown> | undefined;
            const retryCountRaw = headers?.['x-retry-count'];
            const retryCount = typeof retryCountRaw === 'number' ? retryCountRaw : typeof retryCountRaw === 'string' ? Number(retryCountRaw) : 0;
            if (Number.isFinite(retryCount) && retryCount > 0) {
                bookingRabbitRetryReceivedTotal.inc({ queue, routingKey, eventType, retryCount: String(retryCount) });
            }

            const endTimer = bookingRabbitConsumeDurationSeconds.startTimer({ queue, routingKey, eventType });

            const processOnce = async () => {
                if (isRefunded(payload)) {
                    const updated = await applyPaymentRefundEvent({
                        uow: prismaUnitOfWork,
                        bookings: bookingsRepo,
                        bookingId,
                        outcome: 'REFUNDED',
                    });

                    const createdAt = updated.createdAt instanceof Date ? updated.createdAt.getTime() : undefined;
                    if (typeof createdAt === 'number') {
                        const seconds = (Date.now() - createdAt) / 1000;
                        if (Number.isFinite(seconds) && seconds >= 0) {
                            bookingLifecycleDurationSeconds.observe({ transition: 'created_to_refunded' }, seconds);
                        }
                    }
                    logger.info('Booking payment marked REFUNDED', { bookingId });
                    return;
                }

                if (isRefundFailed(payload)) {
                    const updated = await applyPaymentRefundEvent({
                        uow: prismaUnitOfWork,
                        bookings: bookingsRepo,
                        bookingId,
                        outcome: 'REFUND_FAILED',
                    });

                    const createdAt = updated.createdAt instanceof Date ? updated.createdAt.getTime() : undefined;
                    if (typeof createdAt === 'number') {
                        const seconds = (Date.now() - createdAt) / 1000;
                        if (Number.isFinite(seconds) && seconds >= 0) {
                            bookingLifecycleDurationSeconds.observe({ transition: 'created_to_refund_failed' }, seconds);
                        }
                    }
                    logger.warn('Booking payment marked REFUND_FAILED', { bookingId, reason: payload.data.reason });
                }
            };

            if (typeof messageId === 'string' && messageId.length > 0) {
                const { skipped } = await prismaIdempotencyStore.runOnce(
                    {
                        consumer: 'booking-service/payment-refund-events',
                        messageId,
                        eventType,
                        routingKey,
                    },
                    processOnce,
                );
                if (skipped) {
                    bookingRabbitConsumeTotal.inc({ queue, routingKey, eventType, status: 'skipped' });
                    logger.info('Skipping already-processed refund event', { messageId });
                } else {
                    bookingRabbitConsumeTotal.inc({ queue, routingKey, eventType, status: 'ok' });
                }
                endTimer();
                return;
            }

            await processOnce();
            bookingRabbitConsumeTotal.inc({ queue, routingKey, eventType, status: 'ok' });
            endTimer();
        },
    );
}
