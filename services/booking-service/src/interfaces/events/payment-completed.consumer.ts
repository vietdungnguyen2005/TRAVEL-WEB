import { Logger, rabbitAssertTopology, rabbitConsumeWithRetry } from '@travel-web/shared';
import type { EventMessage } from '@travel-web/contracts';
import { prismaUnitOfWork } from '../../infrastructure/prisma/prisma-unit-of-work';
import { createPrismaBookingRepository } from '../../infrastructure/prisma/prisma-booking-repository';
import { createPrismaOutboxRepository } from '../../infrastructure/prisma/prisma-outbox-repository';
import { prismaIdempotencyStore } from '../../infrastructure/idempotency/prisma-idempotency-store';
import { confirmBookingFromPaymentCompleted } from '../../application/usecases/confirm-booking-from-payment-completed';
import {
    bookingRabbitConsumeDurationSeconds,
    bookingRabbitConsumeTotal,
    bookingRabbitRetryReceivedTotal,
    bookingRabbitRetryScheduledTotal,
    bookingLifecycleDurationSeconds,
} from '../../lib/metrics';

const logger = new Logger('PaymentCompletedConsumer');

type PaymentCompletedData = { bookingId: string };

function isPaymentCompletedEvent(payload: unknown): payload is EventMessage<'PaymentCompleted', PaymentCompletedData> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : null;
    return p.type === 'PaymentCompleted' && !!data && typeof data.bookingId === 'string';
}

export async function startPaymentCompletedConsumer() {
    if (process.env.ENABLE_PAYMENT_EVENTS_CONSUMER !== 'true') {
        logger.warn('ENABLE_PAYMENT_EVENTS_CONSUMER is not true; skipping payment.completed consumer');
        return;
    }
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping payment.completed consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is not set');

    const exchange = process.env.RABBITMQ_EXCHANGE || 'events';
    const dlx = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';
    const queueName = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';

    await rabbitAssertTopology({
        exchange: { name: exchange, type: 'topic' },
        dlx: { exchange: { name: dlx, type: 'topic' } },
        queues: [
            {
                name: queueName,
                options: {
                    durable: true,
                    arguments: {
                        'x-dead-letter-exchange': dlx,
                        'x-dead-letter-routing-key': `${queueName}.dlq`,
                    },
                },
                bindings: [{ exchange, routingKey: 'payment.completed' }],
            },
            {
                name: `${queueName}.dlq`,
                options: { durable: true },
                bindings: [{ exchange: dlx, routingKey: `${queueName}.dlq` }],
            },
        ],
        retry: {
            exchange: { name: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', type: 'topic' },
            queues: [
                {
                    name: `${queueName}.retry.5000`,
                    ttlMs: 5000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'payment.completed',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queueName}.retry.5000` }],
                },
                {
                    name: `${queueName}.retry.30000`,
                    ttlMs: 30000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'payment.completed',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queueName}.retry.30000` }],
                },
                {
                    name: `${queueName}.retry.300000`,
                    ttlMs: 300000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'payment.completed',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queueName}.retry.300000` }],
                },
            ],
        },
    });

    const bookingsRepo = createPrismaBookingRepository();
    const outboxRepo = createPrismaOutboxRepository();

    await rabbitConsumeWithRetry(
        {
            queue: queueName,
            bindingKeys: ['payment.completed'],
            prefetch: 20,
            consumerTag: 'booking-service/payment-completed',
            enableRetry: true,
            maxRetries: 3,
            retryDelaysMs: [5000, 30000, 300000],
            onRetryScheduled: ({ queue, routingKey, delayMs, nextRetry }) => {
                bookingRabbitRetryScheduledTotal.inc({
                    queue,
                    routingKey,
                    eventType: 'payment.completed',
                    delayMs: String(delayMs),
                    nextRetry: String(nextRetry),
                });
            },
        },
        async (payload, raw) => {
            if (!isPaymentCompletedEvent(payload)) return;

            const routingKey = raw.fields.routingKey;
            const messageId = raw.properties.messageId;
            const eventTypeLabel = 'payment.completed';

            const headers = raw.properties.headers as Record<string, unknown> | undefined;
            const retryCountRaw = headers?.['x-retry-count'];
            const retryCount = typeof retryCountRaw === 'number' ? retryCountRaw : typeof retryCountRaw === 'string' ? Number(retryCountRaw) : 0;
            if (Number.isFinite(retryCount) && retryCount > 0) {
                bookingRabbitRetryReceivedTotal.inc({
                    queue: queueName,
                    routingKey,
                    eventType: eventTypeLabel,
                    retryCount: String(retryCount),
                });
            }

            const endTimer = bookingRabbitConsumeDurationSeconds.startTimer({
                queue: queueName,
                routingKey,
                eventType: eventTypeLabel,
            });

            const processOnce = async () => {
                return await confirmBookingFromPaymentCompleted({
                    uow: prismaUnitOfWork,
                    bookings: bookingsRepo,
                    outbox: outboxRepo,
                    bookingId: payload.data.bookingId,
                });
            };

            if (typeof messageId === 'string' && messageId.length > 0) {
                const { skipped, result } = await prismaIdempotencyStore.runOnce(
                    {
                        consumer: 'booking-service/payment-completed',
                        messageId,
                        eventType: payload.type,
                        routingKey,
                    },
                    processOnce,
                );

                if (skipped) {
                    bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                } else {
                    bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'ok' });

                    const createdAt = result?.createdAt instanceof Date ? result.createdAt.getTime() : undefined;
                    if (typeof createdAt === 'number') {
                        const seconds = (Date.now() - createdAt) / 1000;
                        if (Number.isFinite(seconds) && seconds >= 0) {
                            bookingLifecycleDurationSeconds.observe({ transition: 'created_to_confirmed' }, seconds);
                        }
                    }
                }

                endTimer();
                return;
            }

            const updated = await processOnce();
            bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'ok' });

            const createdAt = updated.createdAt instanceof Date ? updated.createdAt.getTime() : undefined;
            if (typeof createdAt === 'number') {
                const seconds = (Date.now() - createdAt) / 1000;
                if (Number.isFinite(seconds) && seconds >= 0) {
                    bookingLifecycleDurationSeconds.observe({ transition: 'created_to_confirmed' }, seconds);
                }
            }
            endTimer();
        },
    );
}
