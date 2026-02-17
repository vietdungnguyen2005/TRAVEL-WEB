"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentEventsConsumer = startPaymentEventsConsumer;
const prisma_1 = __importDefault(require("./prisma"));
const shared_1 = require("@travel-web/shared");
const event_validation_1 = require("./event-validation");
const metrics_1 = require("./metrics");
const logger = new shared_1.Logger('PaymentEventsConsumer');
function isPaymentEvent(payload) {
    if (!payload || typeof payload !== 'object')
        return false;
    const p = payload;
    // Standard envelope: { type, data: { bookingId } }
    const maybe = payload;
    const maybeType = maybe.type;
    const maybeData = maybe.data;
    if (typeof maybeType === 'string' && maybeData && typeof maybeData === 'object') {
        const bookingId = maybeData.bookingId;
        if (typeof bookingId !== 'string')
            return false;
        return (maybeType === 'PaymentCompleted' ||
            maybeType === 'PaymentConfirmed' ||
            maybeType === 'PaymentRefunded' ||
            maybeType === 'RefundRequested' ||
            maybeType === 'RefundRejected');
    }
    // Legacy shape: { type, bookingId }
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
    await (0, shared_1.rabbitConsume)({
        queue,
        bindingKeys: ['payment.*', 'payment.*.*'],
        prefetch: 10,
        consumerTag: 'booking-service/payment-events',
    }, async (payload, raw) => {
        const routingKey = raw.fields.routingKey;
        const queueName = queue;
        if (!isPaymentEvent(payload))
            return;
        const evt = payload;
        const eventTypeLabel = typeof evt.type === 'string' ? evt.type : 'Unknown';
        const endTimer = metrics_1.bookingRabbitConsumeDurationSeconds.startTimer({
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
                const { skipped } = await (0, shared_1.withEventIdempotency)(prisma_1.default, {
                    consumer: 'booking-service/payment-events',
                    messageId,
                    eventType: evt.type,
                    routingKey,
                }, async () => {
                    await handlePaymentEvent(evt);
                });
                if (skipped) {
                    logger.info('Skipping already-processed payment event', { messageId, type: evt.type });
                    metrics_1.bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                }
                else {
                    metrics_1.bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'ok' });
                }
            }
            catch (err) {
                metrics_1.bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: eventTypeLabel, status: 'error' });
                throw err;
            }
            finally {
                endTimer();
            }
            return;
        }
        try {
            await handlePaymentEvent(evt);
            metrics_1.bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: String(evt.type), status: 'ok' });
            endTimer();
        }
        catch (err) {
            metrics_1.bookingRabbitConsumeTotal.inc({ queue: queueName, routingKey, eventType: String(evt.type), status: 'error' });
            endTimer();
            throw err;
        }
    });
}
async function handlePaymentEvent(evt) {
    const eventType = evt.type;
    const bookingId = 'data' in evt ? evt.data.bookingId : evt.bookingId;
    const reason = 'data' in evt ? evt.data.reason : ('reason' in evt ? evt.reason : undefined);
    if (eventType === 'PaymentCompleted' || eventType === 'PaymentConfirmed') {
        // JSON Schema validation (example). If invalid, throw to dead-letter.
        if (eventType === 'PaymentCompleted' && 'data' in evt) {
            const ok = (0, event_validation_1.validatePaymentCompleted)(evt);
            if (!ok) {
                throw new Error(`Invalid PaymentCompleted schema: ${JSON.stringify(event_validation_1.validatePaymentCompleted.errors)}`);
            }
        }
        const updated = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
            },
        });
        await prisma_1.default.outbox.create({
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
        const updated = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
        });
        await prisma_1.default.outbox.create({
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
        await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUND_REQUESTED' },
        });
        logger.info('Booking marked refund requested', { bookingId });
    }
    if (eventType === 'RefundRejected') {
        await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUND_REJECTED' },
        });
        logger.info('Booking marked refund rejected', { bookingId });
    }
}
//# sourceMappingURL=payment-events-consumer.js.map