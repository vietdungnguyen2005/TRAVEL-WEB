"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentEventsConsumer = startPaymentEventsConsumer;
const prisma_1 = __importDefault(require("./prisma"));
const shared_1 = require("@travel-web/shared");
const logger = new shared_1.Logger('PaymentEventsConsumer');
function isPaymentEvent(payload) {
    if (!payload || typeof payload !== 'object')
        return false;
    const p = payload;
    if (typeof p.type !== 'string')
        return false;
    if (typeof p.bookingId !== 'string')
        return false;
    return (p.type === 'PaymentCompleted' ||
        p.type === 'PaymentConfirmed' ||
        p.type === 'PaymentRefunded' ||
        p.type === 'RefundRequested' ||
        p.type === 'RefundRejected');
}
async function startPaymentEventsConsumer() {
    // New simplified flow: payment is not required to confirm.
    // Admin approval is the source of truth (PENDING -> CONFIRMED).
    // Keep this file for compatibility, but don't process payment.* events.
    logger.warn('Payment events consumer disabled: using admin approval flow for booking confirmation');
    return;
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping payment events consumer');
        return;
    }
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }
    const queue = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';
    await (0, shared_1.rabbitConsume)({
        queue,
        bindingKeys: ['payment.*'],
        prefetch: 10,
        consumerTag: 'booking-service/payment-events',
    }, async (payload) => {
        if (!isPaymentEvent(payload))
            return;
        const evt = payload;
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
        if (evt.type === 'RefundRequested') {
            await prisma_1.default.booking.update({
                where: { id: evt.bookingId },
                data: { paymentStatus: 'REFUND_REQUESTED' },
            });
            logger.info('Booking marked refund requested', { bookingId: evt.bookingId });
        }
        if (evt.type === 'RefundRejected') {
            await prisma_1.default.booking.update({
                where: { id: evt.bookingId },
                data: { paymentStatus: 'REFUND_REJECTED' },
            });
            logger.info('Booking marked refund rejected', { bookingId: evt.bookingId });
        }
    });
}
//# sourceMappingURL=payment-events-consumer.js.map