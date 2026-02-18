import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const notificationRabbitConsumeTotal = new client.Counter({
    name: 'notification_rabbitmq_consume_total',
    help: 'Total RabbitMQ messages consumed by notification-service',
    labelNames: ['queue', 'routingKey', 'eventType', 'status'],
});

export const notificationRabbitConsumeDurationSeconds = new client.Histogram({
    name: 'notification_rabbitmq_consume_duration_seconds',
    help: 'RabbitMQ message handler duration in seconds (notification-service)',
    labelNames: ['queue', 'routingKey', 'eventType'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const notificationRabbitRetryReceivedTotal = new client.Counter({
    name: 'notification_rabbitmq_retry_received_total',
    help: 'Total RabbitMQ messages received with x-retry-count > 0 (notification-service)',
    labelNames: ['queue', 'routingKey', 'eventType', 'retryCount'],
});

export const notificationRabbitRetryScheduledTotal = new client.Counter({
    name: 'notification_rabbitmq_retry_scheduled_total',
    help: 'Total RabbitMQ retries scheduled into TTL retry queues (notification-service)',
    labelNames: ['queue', 'routingKey', 'eventType', 'delayMs', 'nextRetry'],
});

export const notificationPersistTotal = new client.Counter({
    name: 'notification_persist_total',
    help: 'Total notifications persisted (notification-service)',
    labelNames: ['status', 'type'],
});

register.registerMetric(notificationRabbitConsumeTotal);
register.registerMetric(notificationRabbitConsumeDurationSeconds);
register.registerMetric(notificationRabbitRetryReceivedTotal);
register.registerMetric(notificationRabbitRetryScheduledTotal);
register.registerMetric(notificationPersistTotal);

export default register;
