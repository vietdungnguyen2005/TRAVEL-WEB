import { Logger, rabbitAssertTopology, rabbitConsumeWithRetry } from '@travel-web/shared';
import type { EventMessage } from '@travel-web/contracts';

import { createPrismaPaymentRepository } from '../../infrastructure/prisma/prisma-payment-repository';
import { createRabbitEventPublisher } from '../../infrastructure/rabbitmq/rabbit-event-publisher';
import { handleBookingCreated } from '../../application/usecases/handle-booking-created';
import { prismaEventIdempotencyStore } from '../../infrastructure/idempotency/prisma-event-idempotency-store';

import {
    paymentRabbitConsumeDurationSeconds,
    paymentRabbitConsumeTotal,
    paymentRabbitRetryReceivedTotal,
    paymentRabbitRetryScheduledTotal,
} from '../../lib/metrics';

const logger = new Logger('BookingEventsConsumer');

type BookingCreatedData = {
    bookingId: string;
    userId: string;
    roomId: string;
};

function isBookingCreatedEvent(payload: unknown): payload is EventMessage<'BookingCreated', BookingCreatedData> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : null;
    return p.type === 'BookingCreated' && !!data && typeof data.bookingId === 'string' && typeof data.userId === 'string' && typeof data.roomId === 'string';
}

export async function startBookingEventsConsumer() {
    if (process.env.ENABLE_BOOKING_EVENTS_CONSUMER !== 'true') {
        logger.warn('ENABLE_BOOKING_EVENTS_CONSUMER is not true; skipping booking events consumer');
        return;
    }
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping booking events consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is not set');

    const queue = process.env.RABBITMQ_QUEUE_BOOKING_EVENTS || 'payment-service.booking-events';
        const dlx = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';

    await rabbitAssertTopology({
        exchange: { name: process.env.RABBITMQ_EXCHANGE || 'events', type: 'topic' },
            dlx: { exchange: { name: dlx, type: 'topic' } },
        queues: [
            {
                name: queue,
                bindings: [{ exchange: process.env.RABBITMQ_EXCHANGE || 'events', routingKey: 'booking.created' }],
                    options: {
                        durable: true,
                        arguments: {
                            'x-dead-letter-exchange': dlx,
                            'x-dead-letter-routing-key': `${queue}.dlq`,
                        },
                    },
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
                    deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                    deadLetterRoutingKey: 'booking.created',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.5000` }],
                },
                {
                    name: `${queue}.retry.30000`,
                    ttlMs: 30000,
                    deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                    deadLetterRoutingKey: 'booking.created',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.30000` }],
                },
                {
                    name: `${queue}.retry.300000`,
                    ttlMs: 300000,
                    deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                    deadLetterRoutingKey: 'booking.created',
                    bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${queue}.retry.300000` }],
                },
            ],
        },
    });

    const paymentsRepo = createPrismaPaymentRepository();
    const publisher = createRabbitEventPublisher();

    await rabbitConsumeWithRetry(
        {
            queue,
            bindingKeys: ['booking.created'],
            prefetch: 20,
            consumerTag: 'payment-service/booking-events',
            enableRetry: true,
            maxRetries: 3,
            retryDelaysMs: [5000, 30000, 300000],
            onRetryScheduled: ({ queue, routingKey, delayMs, nextRetry }) => {
                paymentRabbitRetryScheduledTotal.inc({
                    queue,
                    routingKey,
                    eventType: 'booking.created',
                    delayMs: String(delayMs),
                    nextRetry: String(nextRetry),
                });
            },
        },
        async (payload, raw) => {
            if (!isBookingCreatedEvent(payload)) return;

            const routingKey = raw.fields.routingKey;
            const eventTypeLabel = 'booking.created';
            const headers = raw.properties.headers as Record<string, unknown> | undefined;
            const retryCountRaw = headers?.['x-retry-count'];
            const retryCount = typeof retryCountRaw === 'number' ? retryCountRaw : typeof retryCountRaw === 'string' ? Number(retryCountRaw) : 0;
            if (Number.isFinite(retryCount) && retryCount > 0) {
                paymentRabbitRetryReceivedTotal.inc({
                    queue,
                    routingKey,
                    eventType: eventTypeLabel,
                    retryCount: String(retryCount),
                });
            }

            const endConsumeTimer = paymentRabbitConsumeDurationSeconds.startTimer({ queue, routingKey, eventType: eventTypeLabel });
            const messageId = raw.properties.messageId;

            const processOnce = async () => {
                await handleBookingCreated({
                    payments: paymentsRepo,
                    publisher,
                    input: payload.data,
                    causationId: typeof messageId === 'string' ? messageId : undefined,
                    sourceRoutingKey: routingKey,
                });
            };

            if (typeof messageId === 'string' && messageId.length > 0) {
                const { skipped } = await prismaEventIdempotencyStore.runOnce(
                    {
                        consumer: 'payment-service/booking-events',
                        messageId,
                        eventType: 'booking.created',
                        routingKey,
                    },
                    processOnce,
                );

                if (skipped) {
                    paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                } else {
                    paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
                }

                endConsumeTimer();
                return;
            }

            await processOnce();
            paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
            endConsumeTimer();
        },
    );
}
