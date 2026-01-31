import prisma from './prisma';
import { Logger, rabbitConsume, rabbitPublish } from '@travel-web/shared';

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

function isPaymentEvent(payload: unknown): payload is PaymentEvent {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as { type?: unknown; bookingId?: unknown };
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
            bindingKeys: ['payment.*'],
            prefetch: 10,
            consumerTag: 'booking-service/payment-events',
        },
        async (payload) => {
            if (!isPaymentEvent(payload)) return;
            const evt = payload;

            if (evt.type === 'PaymentCompleted' || evt.type === 'PaymentConfirmed') {
                const updated = await prisma.booking.update({
                    where: { id: evt.bookingId },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                    },
                });

                await prisma.outbox.create({
                    data: {
                        aggregateType: 'Booking',
                        aggregateId: updated.id,
                        eventType: 'BookingConfirmed',
                        payload: {
                            id: updated.id,
                            userId: updated.userId,
                            roomId: updated.roomId,
                            status: updated.status,
                            paymentStatus: updated.paymentStatus,
                        },
                    },
                });

                await rabbitPublish({
                    routingKey: 'booking.bookingconfirmed',
                    message: {
                        type: 'BookingConfirmed',
                        bookingId: updated.id,
                        userId: updated.userId,
                        roomId: updated.roomId,
                        at: new Date().toISOString(),
                    },
                });

                logger.info('Booking confirmed from payment event', { bookingId: updated.id, type: evt.type });
                return;
            }

            if (evt.type === 'PaymentRefunded') {
                const updated = await prisma.booking.update({
                    where: { id: evt.bookingId },
                    data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
                });

                await prisma.outbox.create({
                    data: {
                        aggregateType: 'Booking',
                        aggregateId: updated.id,
                        eventType: 'BookingCancelled',
                        payload: {
                            id: updated.id,
                            status: updated.status,
                            paymentStatus: updated.paymentStatus,
                            reason: evt.reason,
                        },
                    },
                });

                await rabbitPublish({
                    routingKey: 'booking.bookingcancelled',
                    message: {
                        type: 'BookingCancelled',
                        bookingId: updated.id,
                        userId: updated.userId,
                        at: new Date().toISOString(),
                        reason: evt.reason,
                    },
                });

                logger.info('Booking cancelled from refund event', { bookingId: updated.id });
            }

            if (evt.type === 'RefundRequested') {
                await prisma.booking.update({
                    where: { id: evt.bookingId },
                    data: { paymentStatus: 'REFUND_REQUESTED' },
                });
                logger.info('Booking marked refund requested', { bookingId: evt.bookingId });
            }

            if (evt.type === 'RefundRejected') {
                await prisma.booking.update({
                    where: { id: evt.bookingId },
                    data: { paymentStatus: 'REFUND_REJECTED' },
                });
                logger.info('Booking marked refund rejected', { bookingId: evt.bookingId });
            }
        },
    );
}
