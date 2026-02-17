"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBookingEventsConsumer = startBookingEventsConsumer;
const prisma_1 = __importDefault(require("./prisma"));
const shared_1 = require("@travel-web/shared");
const payment_client_1 = require("../../node_modules/.prisma/payment-client");
const metrics_1 = require("./metrics");
const logger = new shared_1.Logger('BookingEventsConsumer');
function isBookingCreatedEvent(payload) {
    if (!payload || typeof payload !== 'object')
        return false;
    const p = payload;
    const data = p.data && typeof p.data === 'object' ? p.data : null;
    return (typeof p.id === 'string' &&
        p.type === 'BookingCreated' &&
        typeof p.source === 'string' &&
        typeof p.occurredAt === 'string' &&
        typeof p.version === 'number' &&
        !!data &&
        typeof data.bookingId === 'string' &&
        typeof data.userId === 'string');
}
async function startBookingEventsConsumer() {
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
    await (0, shared_1.rabbitConsume)({
        queue,
        bindingKeys: ['booking.created'],
        prefetch: 20,
        consumerTag: 'payment-service/booking-events',
    }, async (payload, raw) => {
        if (!isBookingCreatedEvent(payload))
            return;
        const routingKey = raw.fields.routingKey;
        const eventTypeLabel = 'booking.created';
        const endConsumeTimer = metrics_1.paymentRabbitConsumeDurationSeconds.startTimer({
            queue,
            routingKey,
            eventType: eventTypeLabel,
        });
        const messageId = raw.properties.messageId;
        const processOnce = async () => {
            const bookingId = payload.data.bookingId;
            // Simple demo rule: auto-complete payment immediately.
            await prisma_1.default.payment.upsert({
                where: { bookingId },
                create: {
                    bookingId,
                    userId: payload.data.userId,
                    amount: 0,
                    currency: 'vnd',
                    status: payment_client_1.PaymentStatus.COMPLETED,
                    metadata: { source: 'queue-demo', roomId: payload.data.roomId },
                },
                update: {
                    status: payment_client_1.PaymentStatus.COMPLETED,
                    metadata: { source: 'queue-demo', roomId: payload.data.roomId },
                },
            });
            const outEventId = `payment.completed:${bookingId}`;
            const event = {
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
            const endPublishTimer = metrics_1.paymentRabbitPublishDurationSeconds.startTimer({ routingKey: 'payment.completed' });
            try {
                await (0, shared_1.rabbitPublish)({
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
                metrics_1.paymentRabbitPublishTotal.inc({ routingKey: 'payment.completed', status: 'ok' });
            }
            catch (err) {
                metrics_1.paymentRabbitPublishTotal.inc({ routingKey: 'payment.completed', status: 'error' });
                throw err;
            }
            finally {
                endPublishTimer();
            }
            logger.info('Processed booking.created -> payment.completed', { bookingId });
        };
        if (typeof messageId === 'string' && messageId.length > 0) {
            try {
                const { skipped } = await (0, shared_1.withEventIdempotency)(prisma_1.default, {
                    consumer: 'payment-service/booking-events',
                    messageId,
                    eventType: 'booking.created',
                    routingKey,
                }, processOnce);
                if (skipped) {
                    logger.info('Skipping already-processed booking.created', { messageId });
                    metrics_1.paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'skipped' });
                }
                else {
                    metrics_1.paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
                }
            }
            catch (err) {
                metrics_1.paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'error' });
                throw err;
            }
            finally {
                endConsumeTimer();
            }
            return;
        }
        try {
            await processOnce();
            metrics_1.paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'ok' });
        }
        catch (err) {
            metrics_1.paymentRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventTypeLabel, status: 'error' });
            throw err;
        }
        finally {
            endConsumeTimer();
        }
    });
}
//# sourceMappingURL=booking-events-consumer.js.map