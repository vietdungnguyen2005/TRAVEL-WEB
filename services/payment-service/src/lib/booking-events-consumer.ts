import prisma from './prisma';
import { Logger, rabbitConsume, rabbitPublish, withEventIdempotency } from '@travel-web/shared';
import type { EventMessage } from '@travel-web/contracts';
import { PaymentStatus } from '../../node_modules/.prisma/payment-client';
import {
    paymentRabbitConsumeDurationSeconds,
    paymentRabbitConsumeTotal,
    paymentRabbitPublishDurationSeconds,
    paymentRabbitPublishTotal,
} from './metrics';

const logger = new Logger('BookingEventsConsumer');

type BookingCreatedData = {
    bookingId: string;
    userId: string;
    roomId: string;
    checkIn?: string;
    checkOut?: string;
    totalPrice?: unknown;
    status?: string;
};

function isBookingCreatedEvent(payload: unknown): payload is EventMessage<'BookingCreated', BookingCreatedData> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const data = p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : null;
    return (
        typeof p.id === 'string' &&
        p.type === 'BookingCreated' &&
        typeof p.source === 'string' &&
        typeof p.occurredAt === 'string' &&
        typeof p.version === 'number' &&
        !!data &&
        typeof data.bookingId === 'string' &&
        typeof data.userId === 'string'
    );
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
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }

    const queue = process.env.RABBITMQ_QUEUE_BOOKING_EVENTS || 'payment-service.booking-events';

    await rabbitConsume(
        {
            queue,
            bindingKeys: ['booking.created'],
            prefetch: 20,
            consumerTag: 'payment-service/booking-events',
        },
        async (payload, raw) => {
            if (!isBookingCreatedEvent(payload)) return;

            const routingKey = raw.fields.routingKey;
            const eventTypeLabel = 'booking.created';
            const endConsumeTimer = paymentRabbitConsumeDurationSeconds.startTimer({
                queue,
                routingKey,
                eventType: eventTypeLabel,
            });

            const messageId = raw.properties.messageId;

            const processOnce = async () => {
                const bookingId = payload.data.bookingId;

                // Simple demo rule: auto-complete payment immediately.
                await prisma.payment.upsert({
                    where: { bookingId },
                    create: {
                        bookingId,
                        userId: payload.data.userId,
                        amount: 0,
                        currency: 'vnd',
                        status: PaymentStatus.COMPLETED,
                        metadata: { source: 'queue-demo', roomId: payload.data.roomId },
                    },
                    update: {
                        status: PaymentStatus.COMPLETED,
                        metadata: { source: 'queue-demo', roomId: payload.data.roomId },
                    },
                });

                const outEventId = `payment.completed:${bookingId}`;
                const event: EventMessage<'PaymentCompleted', { bookingId: string; userId: string }> = {
                    id: outEventId,
                    type: 'PaymentCompleted',
                    source: 'payment-service',
                    occurredAt: new Date().toISOString(),
                    version: 1,
                    correlationId: bookingId,
                    causationId: typeof messageId === 'string' ? messageId : undefined,
                    data: {
                        bookingId,
                        userId: payload.data.userId,
                    },
                };

                const endPublishTimer = paymentRabbitPublishDurationSeconds.startTimer({ routingKey: 'payment.completed' });
                try {
                    await rabbitPublish({
                        routingKey: 'payment.completed',
                        message: event,
                        options: {
                            messageId: outEventId,
                            correlationId: bookingId,
                            headers: {
                                'x-causation-id': typeof messageId === 'string' ? messageId : undefined,
                                'x-source-routing-key': routingKey,
                            },
                        },
                    });
                    paymentRabbitPublishTotal.inc({ routingKey: 'payment.completed', status: 'ok' });
                } catch (err) {
                    paymentRabbitPublishTotal.inc({ routingKey: 'payment.completed', status: 'error' });
                    throw err;
                } finally {
                    endPublishTimer();
                }

                logger.info('Processed booking.created -> payment.completed', { bookingId });
            };

            if (typeof messageId === 'string' && messageId.length > 0) {
                try {
                    const { skipped } = await withEventIdempotency(prisma as unknown as Parameters<typeof withEventIdempotency>[0], {
                        consumer: 'payment-service/booking-events',
                        messageId,
                        eventType: 'booking.created',
                        routingKey,
                    }, processOnce);
                    if (skipped) {
                        logger.info('Skipping already-processed booking.created', { messageId });
                        paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                    } else {
                        paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
                    }
                } catch (err) {
                    paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'error' });
                    throw err;
                } finally {
                    endConsumeTimer();
                }
                return;
            }

            try {
                await processOnce();
                paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
            } catch (err) {
                paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'error' });
                throw err;
            } finally {
                endConsumeTimer();
            }
        },
    );
}
