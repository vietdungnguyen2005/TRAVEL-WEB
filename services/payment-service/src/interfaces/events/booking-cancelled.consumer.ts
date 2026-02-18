import { Logger, rabbitAssertTopology, rabbitConsumeWithRetry } from '@travel-web/shared';
import type { EventMessage } from '@travel-web/contracts';

import { getStripeClient } from '../../lib/stripe-client';
import { createPrismaPaymentRepository } from '../../infrastructure/prisma/prisma-payment-repository';
import { createRabbitEventPublisher } from '../../infrastructure/rabbitmq/rabbit-event-publisher';
import { createStripeGateway } from '../../infrastructure/stripe/stripe-gateway';
import { handleBookingCancelledRefund } from '../../application/usecases/handle-booking-cancelled-refund';
import { prismaEventIdempotencyStore } from '../../infrastructure/idempotency/prisma-event-idempotency-store';

import {
    paymentRabbitConsumeDurationSeconds,
    paymentRabbitConsumeTotal,
    paymentRabbitRetryReceivedTotal,
    paymentRabbitRetryScheduledTotal,
} from '../../lib/metrics';

const logger = new Logger('BookingCancelledConsumer');

type BookingCancelledData = {
    bookingId: string;
    userId?: string;
    roomId?: string;
    status?: string;
    paymentStatus?: string | null;
};

function isBookingCancelledEvent(payload: unknown): payload is EventMessage<'BookingCancelled', BookingCancelledData> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : null;
    return p.type === 'BookingCancelled' && !!data && typeof data.bookingId === 'string';
}

export async function startBookingCancelledConsumer() {
    if (process.env.ENABLE_BOOKING_CANCELLED_CONSUMER !== 'true') {
        logger.warn('ENABLE_BOOKING_CANCELLED_CONSUMER is not true; skipping booking-cancelled consumer');
        return;
    }
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping booking-cancelled consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is not set');

    const queue = process.env.RABBITMQ_QUEUE_BOOKING_CANCELLED || 'payment-service.booking-cancelled';
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
                bindings: [{ exchange, routingKey: 'booking.cancelled' }],
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
                    deadLetterRoutingKey: 'booking.cancelled',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.5000` }],
                },
                {
                    name: `${queue}.retry.30000`,
                    ttlMs: 30000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'booking.cancelled',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.30000` }],
                },
                {
                    name: `${queue}.retry.300000`,
                    ttlMs: 300000,
                    deadLetterExchange: exchange,
                    deadLetterRoutingKey: 'booking.cancelled',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.300000` }],
                },
            ],
        },
    });

    const paymentsRepo = createPrismaPaymentRepository();
    const publisher = createRabbitEventPublisher();
    const stripeGateway = createStripeGateway(getStripeClient());

    await rabbitConsumeWithRetry(
        {
            queue,
            bindingKeys: ['booking.cancelled'],
            prefetch: 10,
            consumerTag: 'payment-service/booking-cancelled',
            enableRetry: true,
            maxRetries: 3,
            retryDelaysMs: [5000, 30000, 300000],
            onRetryScheduled: ({ queue, routingKey, delayMs, nextRetry }) => {
                paymentRabbitRetryScheduledTotal.inc({
                    queue,
                    routingKey,
                    eventType: 'booking.cancelled',
                    delayMs: String(delayMs),
                    nextRetry: String(nextRetry),
                });
            },
        },
        async (payload, raw) => {
            if (!isBookingCancelledEvent(payload)) return;

            const routingKey = raw.fields.routingKey;
            const messageId = raw.properties.messageId;

            const headers = raw.properties.headers as Record<string, unknown> | undefined;
            const retryCountRaw = headers?.['x-retry-count'];
            const retryCount = typeof retryCountRaw === 'number' ? retryCountRaw : typeof retryCountRaw === 'string' ? Number(retryCountRaw) : 0;
            if (Number.isFinite(retryCount) && retryCount > 0) {
                paymentRabbitRetryReceivedTotal.inc({
                    queue,
                    routingKey,
                    eventType: 'booking.cancelled',
                    retryCount: String(retryCount),
                });
            }

            const endTimer = paymentRabbitConsumeDurationSeconds.startTimer({
                queue,
                routingKey,
                eventType: 'booking.cancelled',
            });

            const processOnce = async () => {
                await handleBookingCancelledRefund({
                    payments: paymentsRepo,
                    publisher,
                    stripe: stripeGateway,
                    bookingId: payload.data.bookingId,
                    causationId: typeof messageId === 'string' ? messageId : undefined,
                    sourceRoutingKey: routingKey,
                });

                logger.info('Processed booking.cancelled -> refund attempt', { bookingId: payload.data.bookingId });
            };

            if (typeof messageId === 'string' && messageId.length > 0) {
                const { skipped } = await prismaEventIdempotencyStore.runOnce(
                    {
                        consumer: 'payment-service/booking-cancelled',
                        messageId,
                        eventType: 'booking.cancelled',
                        routingKey,
                    },
                    processOnce,
                );

                if (skipped) {
                    paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: 'booking.cancelled', status: 'skipped' });
                    logger.info('Skipping already-processed booking.cancelled', { messageId });
                } else {
                    paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: 'booking.cancelled', status: 'ok' });
                }

                endTimer();
                return;
            }

            await processOnce();
            paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: 'booking.cancelled', status: 'ok' });
            endTimer();
        },
    );
}
