import express from 'express';
import { consulRegisterService, Logger, rabbitConsume, withEventIdempotency, loadEnvProfile } from '@travel-web/shared';
import prisma from './lib/prisma';
import metricsRegister, {
    notificationPersistTotal,
    notificationRabbitConsumeDurationSeconds,
    notificationRabbitConsumeTotal,
} from './lib/metrics';

const app = express();
const PORT = process.env.PORT || 3006;
const logger = new Logger('NotificationService');

// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
loadEnvProfile({ cwd: process.cwd().split('/services/')[0] });

app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'notification-service' }));

app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
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
    const queue = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notification-service.events';
    await rabbitConsume(
        {
            queue,
            bindingKeys: ['booking.*', 'payment.*'],
            prefetch: 20,
            consumerTag: 'notification-service/events',
        },
        async (payload, raw) => {
            const routingKey = raw.fields.routingKey;
            const evt = payload && typeof payload === 'object'
                ? (payload as Record<string, unknown>)
                : undefined;

            const data = evt?.data && typeof evt.data === 'object'
                ? (evt.data as Record<string, unknown>)
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
                await prisma.notification.create({
                    data: {
                        userId: userId || null,
                        bookingId: bookingId || null,
                        type: eventType || 'UnknownEvent',
                        channel: 'EMAIL',
                        to: String(process.env.NOTIFICATION_FALLBACK_EMAIL || 'unknown@example.com'),
                        subject: `Event: ${eventType || 'Unknown'}`,
                        payload: (payload ?? {}) as object,
                        status: 'PENDING',
                    },
                });
                notificationPersistTotal.inc({ status: 'PENDING', type: eventType || 'UnknownEvent' });
            };

            const messageId = raw?.properties?.messageId;
            if (typeof messageId === 'string' && messageId.length > 0) {
                const endTimer = notificationRabbitConsumeDurationSeconds.startTimer({
                    queue,
                    routingKey,
                    eventType: eventType || 'Unknown',
                });
                try {
                    const { skipped } = await withEventIdempotency(prisma as unknown as Parameters<typeof withEventIdempotency>[0], {
                        consumer: 'notification-service/events',
                        messageId,
                        eventType,
                        routingKey,
                    }, persist);
                    if (skipped) {
                        logger.info('Skipping already-processed notification event', { messageId });
                        notificationRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventType || 'Unknown', status: 'skipped' });
                    } else {
                        notificationRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventType || 'Unknown', status: 'ok' });
                    }
                } catch (err) {
                    notificationRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventType || 'Unknown', status: 'error' });
                    throw err;
                } finally {
                    endTimer();
                }
                return;
            }

            try {
                const endTimer = notificationRabbitConsumeDurationSeconds.startTimer({
                    queue,
                    routingKey,
                    eventType: eventType || 'Unknown',
                });
                try {
                    await persist();
                    notificationRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventType || 'Unknown', status: 'ok' });
                } finally {
                    endTimer();
                }
            } catch (err) {
                logger.error('Failed to persist notification', err as Error);
                notificationRabbitConsumeTotal.inc({ queue, routingKey, eventType: eventType || 'Unknown', status: 'error' });
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
