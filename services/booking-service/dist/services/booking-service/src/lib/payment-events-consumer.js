"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentEventsConsumer = startPaymentEventsConsumer;
const prisma_1 = __importDefault(require("./prisma"));
const shared_1 = require("@travel-web/shared");
const logger = new shared_1.Logger('PaymentEventsConsumer');
async function startPaymentEventsConsumer() {
    const queue = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';
    await (0, shared_1.rabbitConsume)({
        queue,
        bindingKeys: ['payment.*'],
        prefetch: 10,
        consumerTag: 'booking-service/payment-events',
    }, async (evt) => {
        if (!evt?.bookingId)
            return;
        if (evt.type === 'PaymentCompleted' || evt.type === 'PaymentConfirmed') {
            const updated = await prisma_1.default.booking.update({
                where: { id: evt.bookingId },
                data: {
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID',
                },
            });
            await prisma_1.default.outbox.create({
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
            await (0, shared_1.rabbitPublish)({
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
            const updated = await prisma_1.default.booking.update({
                where: { id: evt.bookingId },
                data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
            });
            await prisma_1.default.outbox.create({
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
            await (0, shared_1.rabbitPublish)({
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