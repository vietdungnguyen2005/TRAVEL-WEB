import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const paymentRabbitConsumeTotal = new client.Counter({
    name: 'payment_rabbitmq_consume_total',
    help: 'Total RabbitMQ messages consumed by payment-service',
    labelNames: ['queue', 'routingKey', 'eventType', 'status'],
});

export const paymentRabbitConsumeDurationSeconds = new client.Histogram({
    name: 'payment_rabbitmq_consume_duration_seconds',
    help: 'RabbitMQ message handler duration in seconds (payment-service)',
    labelNames: ['queue', 'routingKey', 'eventType'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const paymentRabbitPublishTotal = new client.Counter({
    name: 'payment_rabbitmq_publish_total',
    help: 'Total RabbitMQ messages published by payment-service',
    labelNames: ['routingKey', 'status'],
});

export const paymentRabbitPublishDurationSeconds = new client.Histogram({
    name: 'payment_rabbitmq_publish_duration_seconds',
    help: 'RabbitMQ publish duration in seconds (payment-service)',
    labelNames: ['routingKey'],
    buckets: [0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

register.registerMetric(paymentRabbitConsumeTotal);
register.registerMetric(paymentRabbitConsumeDurationSeconds);
register.registerMetric(paymentRabbitPublishTotal);
register.registerMetric(paymentRabbitPublishDurationSeconds);

export default register;
