import prisma from './prisma';
import { Logger, rabbitConsume, rabbitPublish } from '@travel-web/shared';
const logger = new Logger('PaymentEventsConsumer');
export async function startPaymentEventsConsumer() {
    const queue = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';
    await rabbitConsume({
        queue,
        bindingKeys: ['payment.*'],
        prefetch: 10,
        consumerTag: 'booking-service/payment-events',
    }, async (evt) => {
        if (!evt?.bookingId)
            return;
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
    });
}
//# sourceMappingURL=payment-events-consumer.js.map