"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const prisma_1 = __importDefault(require("./lib/prisma"));
const load_env_profile_1 = require("../../../infra/scripts/load-env-profile");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3006;
const logger = new shared_1.Logger('NotificationService');
// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
(0, load_env_profile_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'notification-service' }));
async function startConsumers() {
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping RabbitMQ consumers');
        return;
    }
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }
    const queue = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notification-service.events';
    await (0, shared_1.rabbitConsume)({
        queue,
        bindingKeys: ['booking.*', 'payment.*'],
        prefetch: 20,
        consumerTag: 'notification-service/events',
    }, async (payload) => {
        const evt = (payload && typeof payload === 'object'
            ? payload
            : undefined);
        // TODO: integrate real email/SMS sending and templates.
        logger.info('Received event', {
            type: typeof evt?.type === 'string' ? evt.type : undefined,
            bookingId: typeof evt?.bookingId === 'string' ? evt.bookingId : undefined,
            userId: typeof evt?.userId === 'string' ? evt.userId : undefined,
        });
        // Persist as PENDING notification for retryable processing.
        // For now, we store minimal metadata; actual "to" can be resolved via user profile service later.
        try {
            await prisma_1.default.notification.create({
                data: {
                    userId: typeof evt?.userId === 'string' ? evt.userId : null,
                    bookingId: typeof evt?.bookingId === 'string' ? evt.bookingId : null,
                    type: typeof evt?.type === 'string' ? evt.type : 'UnknownEvent',
                    channel: 'EMAIL',
                    to: String(process.env.NOTIFICATION_FALLBACK_EMAIL || 'unknown@example.com'),
                    subject: `Event: ${typeof evt?.type === 'string' ? evt.type : 'Unknown'}`,
                    payload: (payload ?? {}),
                    status: 'PENDING',
                },
            });
        }
        catch (err) {
            logger.error('Failed to persist notification', err);
        }
    });
}
app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
    startConsumers().catch((err) => logger.error('Failed to start consumers', err));
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map