import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import { consulRegisterService, Logger, rabbitConsume } from '@travel-web/shared';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3006;
const logger = new Logger('NotificationService');

dotenvConfig({ path: '../../.env' });

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
    await rabbitConsume(
        {
            queue,
            bindingKeys: ['booking.*', 'payment.*'],
            prefetch: 20,
            consumerTag: 'notification-service/events',
        },
        async (evt) => {
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
            } catch (err) {
                logger.error('Failed to persist notification', err as Error);
            }
        },
    );
}

app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
    startConsumers().catch((err) => logger.error('Failed to start consumers', err as Error));

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err as Error));
    }
});
