import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const bookingCreateCounter = new client.Counter({
    name: 'booking_created_total',
    help: 'Total number of bookings created',
    labelNames: ['status']
});

export const bookingRabbitConsumeTotal = new client.Counter({
    name: 'booking_rabbitmq_consume_total',
    help: 'Total RabbitMQ messages consumed by booking-service',
    labelNames: ['queue', 'routingKey', 'eventType', 'status'],
});

export const bookingRabbitConsumeDurationSeconds = new client.Histogram({
    name: 'booking_rabbitmq_consume_duration_seconds',
    help: 'RabbitMQ message handler duration in seconds (booking-service)',
    labelNames: ['queue', 'routingKey', 'eventType'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const bookingOutboxPublishedTotal = new client.Counter({
    name: 'booking_outbox_published_total',
    help: 'Total outbox rows successfully published to RabbitMQ (booking-service)',
    labelNames: ['routingKey'],
});

export const bookingOutboxPublishErrorsTotal = new client.Counter({
    name: 'booking_outbox_publish_errors_total',
    help: 'Total outbox publishing errors (booking-service)',
});

export const bookingOutboxBatchSize = new client.Histogram({
    name: 'booking_outbox_batch_size',
    help: 'Outbox batch sizes read by the publisher (booking-service)',
    buckets: [0, 1, 5, 10, 25, 50, 100, 200],
});

export const bookingOutboxPublishDurationSeconds = new client.Histogram({
    name: 'booking_outbox_publish_duration_seconds',
    help: 'Outbox publish+mark duration in seconds per message (booking-service)',
    labelNames: ['routingKey'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

register.registerMetric(bookingCreateCounter);
register.registerMetric(bookingRabbitConsumeTotal);
register.registerMetric(bookingRabbitConsumeDurationSeconds);
register.registerMetric(bookingOutboxPublishedTotal);
register.registerMetric(bookingOutboxPublishErrorsTotal);
register.registerMetric(bookingOutboxBatchSize);
register.registerMetric(bookingOutboxPublishDurationSeconds);

export default register;
