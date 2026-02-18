"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const prisma_1 = __importDefault(require("./lib/prisma"));
const metrics_1 = __importStar(require("./lib/metrics"));
const email_worker_1 = require("./lib/email-worker");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3006;
const logger = new shared_1.Logger('NotificationService');
// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
(0, shared_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'notification-service' }));
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.default.contentType);
    res.end(await metrics_1.default.metrics());
});
async function startConsumers() {
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping RabbitMQ consumers');
        return;
    }
    if (!process.env.RABBITMQ_URL) {
        logger.warn('RABBITMQ_URL is not set; skipping RabbitMQ consumers');
        return;
    }
    const routes = [
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_BOOKING_CREATED || 'notification-service.booking-created',
            bindingKey: 'booking.created',
            consumerTag: 'notification-service/booking-created',
        },
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_BOOKING_CONFIRMED || 'notification-service.booking-confirmed',
            bindingKey: 'booking.confirmed',
            consumerTag: 'notification-service/booking-confirmed',
        },
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_PAYMENT_COMPLETED || 'notification-service.payment-completed',
            bindingKey: 'payment.completed',
            consumerTag: 'notification-service/payment-completed',
        },
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_BOOKING_CANCELLED || 'notification-service.booking-cancelled',
            bindingKey: 'booking.cancelled',
            consumerTag: 'notification-service/booking-cancelled',
        },
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_PAYMENT_REFUNDED || 'notification-service.payment-refunded',
            bindingKey: 'payment.paymentrefunded',
            consumerTag: 'notification-service/payment-refunded',
        },
        {
            queue: process.env.RABBITMQ_QUEUE_NOTIFICATION_PAYMENT_REFUND_FAILED || 'notification-service.payment-refund-failed',
            bindingKey: 'payment.refund.failed',
            consumerTag: 'notification-service/payment-refund-failed',
        },
    ];
    for (const r of routes) {
        await (0, shared_1.rabbitAssertTopology)({
            exchange: { name: process.env.RABBITMQ_EXCHANGE || 'events', type: 'topic' },
            dlx: { exchange: { name: process.env.RABBITMQ_DLX_EXCHANGE || 'dlx', type: 'topic' } },
            queues: [
                {
                    name: r.queue,
                    bindings: [{ exchange: process.env.RABBITMQ_EXCHANGE || 'events', routingKey: r.bindingKey }],
                },
            ],
            retry: {
                exchange: { name: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', type: 'topic' },
                queues: [
                    {
                        name: `${r.queue}.retry.5000`,
                        ttlMs: 5000,
                        deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                        deadLetterRoutingKey: r.bindingKey,
                        bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${r.queue}.retry.5000` }],
                    },
                    {
                        name: `${r.queue}.retry.30000`,
                        ttlMs: 30000,
                        deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                        deadLetterRoutingKey: r.bindingKey,
                        bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${r.queue}.retry.30000` }],
                    },
                    {
                        name: `${r.queue}.retry.300000`,
                        ttlMs: 300000,
                        deadLetterExchange: process.env.RABBITMQ_EXCHANGE || 'events',
                        deadLetterRoutingKey: r.bindingKey,
                        bindings: [{ exchange: process.env.RABBITMQ_RETRY_EXCHANGE || 'retry', routingKey: `${r.queue}.retry.300000` }],
                    },
                ],
            },
        });
        await (0, shared_1.rabbitConsumeWithRetry)({
            queue: r.queue,
            bindingKeys: [r.bindingKey],
            prefetch: 20,
            consumerTag: r.consumerTag,
            enableRetry: true,
            maxRetries: 3,
            retryDelaysMs: [5000, 30000, 300000],
        }, async (payload, raw) => {
            const routingKey = raw.fields.routingKey;
            const evt = payload && typeof payload === 'object'
                ? payload
                : undefined;
            const data = evt?.data && typeof evt.data === 'object'
                ? evt.data
                : undefined;
            const eventType = typeof evt?.type === 'string' ? evt.type : undefined;
            const bookingId = typeof data?.bookingId === 'string'
                ? data.bookingId
                : typeof evt?.bookingId === 'string'
                    ? evt.bookingId
                    : undefined;
            const userId = typeof data?.userId === 'string'
                ? data.userId
                : typeof evt?.userId === 'string'
                    ? evt.userId
                    : undefined;
            // TODO: integrate real email/SMS sending and templates.
            logger.info('Received event', {
                type: eventType,
                bookingId,
                userId,
            });
            const persist = async () => {
                // Persist as PENDING notification for retryable processing.
                // For now, we store minimal metadata; actual "to" can be resolved via user profile service later.
                await prisma_1.default.notification.create({
                    data: {
                        userId: userId || null,
                        bookingId: bookingId || null,
                        type: eventType || 'UnknownEvent',
                        channel: 'EMAIL',
                        to: String(process.env.NOTIFICATION_FALLBACK_EMAIL || 'unknown@example.com'),
                        subject: `Event: ${eventType || 'Unknown'}`,
                        payload: (payload ?? {}),
                        status: 'PENDING',
                    },
                });
                metrics_1.notificationPersistTotal.inc({ status: 'PENDING', type: eventType || 'UnknownEvent' });
            };
            const messageId = raw?.properties?.messageId;
            if (typeof messageId === 'string' && messageId.length > 0) {
                const endTimer = metrics_1.notificationRabbitConsumeDurationSeconds.startTimer({
                    queue: r.queue,
                    routingKey,
                    eventType: eventType || 'Unknown',
                });
                try {
                    const { skipped } = await (0, shared_1.withEventIdempotency)(prisma_1.default, {
                        consumer: r.consumerTag,
                        messageId,
                        eventType,
                        routingKey,
                    }, persist);
                    if (skipped) {
                        logger.info('Skipping already-processed notification event', { messageId });
                        metrics_1.notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType: eventType || 'Unknown', status: 'skipped' });
                    }
                    else {
                        metrics_1.notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType: eventType || 'Unknown', status: 'ok' });
                    }
                }
                catch (err) {
                    metrics_1.notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType: eventType || 'Unknown', status: 'error' });
                    throw err;
                }
                finally {
                    endTimer();
                }
                return;
            }
            try {
                const endTimer = metrics_1.notificationRabbitConsumeDurationSeconds.startTimer({
                    queue: r.queue,
                    routingKey,
                    eventType: eventType || 'Unknown',
                });
                try {
                    await persist();
                    metrics_1.notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType: eventType || 'Unknown', status: 'ok' });
                }
                finally {
                    endTimer();
                }
            }
            catch (err) {
                logger.error('Failed to persist notification', err);
                metrics_1.notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType: eventType || 'Unknown', status: 'error' });
            }
        });
    }
}
app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
    startConsumers().catch((err) => logger.error('Failed to start consumers', err));
    // Background worker to send emails and transition notifications: PENDING -> SENT/FAILED (with retries).
    (0, email_worker_1.startEmailWorker)().catch((err) => logger.error('Email worker failed to start', err));
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map