import prisma from './prisma';
import { Logger, rabbitConsume, withEventIdempotency } from '@travel-web/shared';
import type { EventMessage } from '@travel-web/contracts';
import { validatePaymentCompleted } from './event-validation';
import { bookingRabbitConsumeDurationSeconds, bookingRabbitConsumeTotal } from './metrics';

const logger = new Logger('PaymentEventsConsumer');

type PaymentCompletedEvent = {
    type: 'PaymentCompleted';
    bookingId: string;
    userId?: string;
    stripePaymentIntentId?: string;
    at?: string;
};

type PaymentConfirmedEvent = {
    type: 'PaymentConfirmed';
    bookingId: string;
    userId: string;
    status: string;
    paymentMethod: string;
    at?: string;
};

type PaymentRefundedEvent = {
    type: 'PaymentRefunded';
    bookingId: string;
    userId: string;
    reason?: string;
    at?: string;
};

type RefundRequestedEvent = {
    type: 'RefundRequested';
    bookingId: string;
    userId: string;
    reason?: string;
    at?: string;
};

type RefundRejectedEvent = {
    type: 'RefundRejected';
    bookingId: string;
    userId: string;
    at?: string;
};

type PaymentEvent =
    | PaymentCompletedEvent
    | PaymentConfirmedEvent
    | PaymentRefundedEvent
    | RefundRequestedEvent
    | RefundRejectedEvent;

type PaymentEventEnvelope = EventMessage<
    PaymentEvent['type'],
    { bookingId: string; userId?: string; reason?: string; status?: string; paymentMethod?: string }
>;

function isPaymentEvent(payload: unknown): payload is PaymentEvent | PaymentEventEnvelope {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as { type?: unknown; bookingId?: unknown };

    // Standard envelope: { type, data: { bookingId } }
    const maybe = payload as Record<string, unknown>;
    const maybeType = maybe.type;
    const maybeData = maybe.data;
    if (typeof maybeType === 'string' && maybeData && typeof maybeData === 'object') {
        const bookingId = (maybeData as Record<string, unknown>).bookingId;
        if (typeof bookingId !== 'string') return false;
        return (
            maybeType === 'PaymentCompleted' ||
            maybeType === 'PaymentConfirmed' ||
            maybeType === 'PaymentRefunded' ||
            maybeType === 'RefundRequested' ||
            maybeType === 'RefundRejected'
        );
    }

    // Legacy shape: { type, bookingId }
    if (typeof p.type !== 'string') return false;
    if (typeof p.bookingId !== 'string') return false;
    return (
        p.type === 'PaymentCompleted' ||
        p.type === 'PaymentConfirmed' ||
        p.type === 'PaymentRefunded' ||
        p.type === 'RefundRequested' ||
        p.type === 'RefundRejected'
    );
}

export async function startPaymentEventsConsumer() {
    // Default behavior in this repo is admin approval flow.
    // For queue-demo/saga demo, enable explicitly.
    if (process.env.ENABLE_PAYMENT_EVENTS_CONSUMER !== 'true') {
        logger.warn('ENABLE_PAYMENT_EVENTS_CONSUMER is not true; skipping payment events consumer');
        return;
    }

    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping payment events consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }
    const queue = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';

    await rabbitConsume(
        {
            queue,
            bindingKeys: ['payment.*', 'payment.*.*'],
            prefetch: 10,
            consumerTag: 'booking-service/payment-events',
        },
        async (payload, raw) => {
            const routingKey = raw.fields.routingKey;
            const queueName = queue;
            if (!isPaymentEvent(payload)) return;
            const evt = payload;
            const eventTypeLabel = typeof evt.type === 'string' ? evt.type : 'Unknown';
            const endTimer = bookingRabbitConsumeDurationSeconds.startTimer({
                queue: queueName,
                routingKey,
                eventType: eventTypeLabel,
            });

            const messageId = raw.properties.messageId;
            if (typeof messageId !== 'string' || messageId.length === 0) {
                logger.warn('Payment event missing messageId; idempotency disabled for this message', {
                    routingKey: raw.fields.routingKey,
                });
            }

            if (typeof messageId === 'string' && messageId.length > 0) {
                try {
                    const { skipped } = await withEventIdempotency(prisma as unknown as Parameters<typeof withEventIdempotency>[0], {
                        consumer: 'booking-service/payment-events',
                        messageId,
                        eventType: evt.type,
                        routingKey,
                    }, async () => {
                        await handlePaymentEvent(evt);
                    });

                    if (skipped) {
                        logger.info('Skipping already-processed payment event', { messageId, type: evt.type });
                        bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                    } else {
                        bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'ok' });
                    }
                } catch (err) {
                    bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'error' });
                    throw err;
                } finally {
                    endTimer();
                }
                return;
            }

            try {
                await handlePaymentEvent(evt);
                bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: String(evt.type), status: 'ok' });
                endTimer();
            } catch (err) {
                bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: String(evt.type), status: 'error' });
                endTimer();
                throw err;
            }
        },
    );
}

async function handlePaymentEvent(evt: PaymentEvent | PaymentEventEnvelope) {
    const eventType = evt.type;
    const bookingId = 'data' in evt ? evt.data.bookingId : evt.bookingId;
    const reason = 'data' in evt ? evt.data.reason : ('reason' in evt ? evt.reason : undefined);

    if (eventType === 'PaymentCompleted' || eventType === 'PaymentConfirmed') {
        // JSON Schema validation (example). If invalid, throw to dead-letter.
        if (eventType === 'PaymentCompleted' && 'data' in evt) {
            const ok = validatePaymentCompleted(evt);
            if (!ok) {
                throw new Error(`Invalid PaymentCompleted schema: ${JSON.stringify(validatePaymentCompleted.errors)}`);
            }
        }

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
            },
        });

        await prisma.outbox.create({
            data: {
                aggregateType: 'booking',
                aggregateId: updated.id,
                eventType: 'confirmed',
                payload: {
                    id: updated.id,
                    userId: updated.userId,
                    roomId: updated.roomId,
                    status: updated.status,
                    paymentStatus: updated.paymentStatus,
                },
            },
        });

        logger.info('Booking confirmed from payment event', { bookingId: updated.id, type: eventType });
        return;
    }

    if (eventType === 'PaymentRefunded') {
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
        });

        await prisma.outbox.create({
            data: {
                aggregateType: 'booking',
                aggregateId: updated.id,
                eventType: 'cancelled',
                payload: {
                    id: updated.id,
                    status: updated.status,
                    paymentStatus: updated.paymentStatus,
                    reason,
                },
            },
        });

        logger.info('Booking cancelled from refund event', { bookingId: updated.id });
    }

    if (eventType === 'RefundRequested') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUND_REQUESTED' },
        });
        logger.info('Booking marked refund requested', { bookingId });
    }

    if (eventType === 'RefundRejected') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUND_REJECTED' },
        });
        logger.info('Booking marked refund rejected', { bookingId });
    }
}
