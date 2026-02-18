import {
    Logger,
    rabbitAssertTopology,
    rabbitConsumeWithRetry,
} from '@travel-web/shared';

import {
    notificationPersistTotal,
    notificationRabbitConsumeDurationSeconds,
    notificationRabbitConsumeTotal,
    notificationRabbitRetryReceivedTotal,
    notificationRabbitRetryScheduledTotal,
} from '../../lib/metrics';

import { createPrismaNotificationRepository } from '../../infrastructure/prisma/prisma-notification-repository';
import { createPrismaEventIdempotencyStore } from '../../infrastructure/idempotency/prisma-event-idempotency-store';
import { persistPendingNotification } from '../../application/usecases/persist-pending-notification';

const logger = new Logger('NotificationConsumers');

function parseIncomingEvent(payload: unknown) {
    const routingEvent = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : undefined;
    const data = routingEvent?.data && typeof routingEvent.data === 'object' ? (routingEvent.data as Record<string, unknown>) : undefined;

    const eventType = typeof routingEvent?.type === 'string' ? routingEvent.type : undefined;

    const bookingId =
        typeof data?.bookingId === 'string'
            ? data.bookingId
            : typeof routingEvent?.bookingId === 'string'
                ? (routingEvent.bookingId as string)
                : undefined;

    const userId =
        typeof data?.userId === 'string'
            ? data.userId
            : typeof routingEvent?.userId === 'string'
                ? (routingEvent.userId as string)
                : undefined;

    return {
        eventType: eventType || 'UnknownEvent',
        bookingId: bookingId || null,
        userId: userId || null,
    };
}

export async function startNotificationConsumers() {
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
    ] as const;

    const notificationsRepo = createPrismaNotificationRepository();
    const idempotency = createPrismaEventIdempotencyStore();

    for (const r of routes) {
        await rabbitAssertTopology({
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

        await rabbitConsumeWithRetry(
            {
                queue: r.queue,
                bindingKeys: [r.bindingKey],
                prefetch: 20,
                consumerTag: r.consumerTag,
                enableRetry: true,
                maxRetries: 3,
                retryDelaysMs: [5000, 30000, 300000],
                onRetryScheduled: ({ queue, routingKey, delayMs, nextRetry }) => {
                    notificationRabbitRetryScheduledTotal.inc({
                        queue,
                        routingKey,
                        eventType: r.bindingKey,
                        delayMs: String(delayMs),
                        nextRetry: String(nextRetry),
                    });
                },
            },
            async (payload, raw) => {
                const routingKey = raw.fields.routingKey;
                const { eventType, bookingId, userId } = parseIncomingEvent(payload);

                const headers = raw.properties.headers as Record<string, unknown> | undefined;
                const retryCountRaw = headers?.['x-retry-count'];
                const retryCount = typeof retryCountRaw === 'number' ? retryCountRaw : typeof retryCountRaw === 'string' ? Number(retryCountRaw) : 0;
                if (Number.isFinite(retryCount) && retryCount > 0) {
                    notificationRabbitRetryReceivedTotal.inc({
                        queue: r.queue,
                        routingKey,
                        eventType,
                        retryCount: String(retryCount),
                    });
                }

                logger.info('Received event', { type: eventType, bookingId, userId });

                const messageId = raw?.properties?.messageId;
                const endTimer = notificationRabbitConsumeDurationSeconds.startTimer({
                    queue: r.queue,
                    routingKey,
                    eventType: eventType || 'Unknown',
                });

                try {
                    const persist = async () => {
                        const result = await persistPendingNotification({
                            notifications: notificationsRepo,
                            input: {
                                userId,
                                bookingId,
                                type: eventType,
                                payload,
                            },
                        });
                        notificationPersistTotal.inc({ status: result.status, type: result.type });
                        return result;
                    };

                    if (typeof messageId === 'string' && messageId.length > 0) {
                        const { skipped } = await idempotency.runOnce(
                            {
                                consumer: r.consumerTag,
                                messageId,
                                eventType,
                                routingKey,
                            },
                            persist,
                        );

                        if (skipped) {
                            notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType, status: 'skipped' });
                        } else {
                            notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType, status: 'ok' });
                        }

                        return;
                    }

                    await persist();
                    notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType, status: 'ok' });
                } catch (err) {
                    notificationRabbitConsumeTotal.inc({ queue: r.queue, routingKey, eventType, status: 'error' });
                    logger.error('Failed to persist notification', err as Error);
                    throw err;
                } finally {
                    endTimer();
                }
            },
        );
    }
}
