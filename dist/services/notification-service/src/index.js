import express from 'express';
import { consulRegisterService, Logger, rabbitConsume } from '@travel-web/shared';
import prisma from './lib/prisma';
const app = express();
const PORT = process.env.PORT || 3006;
const logger = new Logger('NotificationService');
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'notification-service' }));
async function startConsumers() {
    const queue = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notification-service.events';
    await rabbitConsume({
        queue,
        bindingKeys: ['booking.*', 'payment.*'],
        prefetch: 20,
        consumerTag: 'notification-service/events',
    }, async (evt) => {
        // TODO: integrate real email/SMS sending and templates.
        logger.info('Received event', { type: evt?.type, bookingId: evt?.bookingId, userId: evt?.userId });
        // Persist as PENDING notification for retryable processing.
        // For now, we store minimal metadata; actual "to" can be resolved via user profile service later.
        try {
            await prisma.notification.create({
                data: {
                    userId: evt?.userId || null,
                    bookingId: evt?.bookingId || null,
                    type: String(evt?.type || 'UnknownEvent'),
                    channel: 'EMAIL',
                    to: String(process.env.NOTIFICATION_FALLBACK_EMAIL || 'unknown@example.com'),
                    subject: `Event: ${String(evt?.type || 'Unknown')}`,
                    payload: evt || null,
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
        consulRegisterService({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map