"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingOutboxPublishDurationSeconds = exports.bookingOutboxBatchSize = exports.bookingOutboxPending = exports.bookingOutboxPublishErrorsTotal = exports.bookingOutboxPublishedTotal = exports.bookingLifecycleDurationSeconds = exports.bookingRabbitRetryScheduledTotal = exports.bookingRabbitRetryReceivedTotal = exports.bookingRabbitConsumeDurationSeconds = exports.bookingRabbitConsumeTotal = exports.bookingCreateCounter = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
exports.bookingCreateCounter = new prom_client_1.default.Counter({
    name: 'booking_created_total',
    help: 'Total number of bookings created',
    labelNames: ['status']
});
exports.bookingRabbitConsumeTotal = new prom_client_1.default.Counter({
    name: 'booking_rabbitmq_consume_total',
    help: 'Total RabbitMQ messages consumed by booking-service',
    labelNames: ['queue', 'routingKey', 'eventType', 'status'],
});
exports.bookingRabbitConsumeDurationSeconds = new prom_client_1.default.Histogram({
    name: 'booking_rabbitmq_consume_duration_seconds',
    help: 'RabbitMQ message handler duration in seconds (booking-service)',
    labelNames: ['queue', 'routingKey', 'eventType'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
exports.bookingRabbitRetryReceivedTotal = new prom_client_1.default.Counter({
    name: 'booking_rabbitmq_retry_received_total',
    help: 'Total RabbitMQ messages received with x-retry-count > 0 (booking-service)',
    labelNames: ['queue', 'routingKey', 'eventType', 'retryCount'],
});
exports.bookingRabbitRetryScheduledTotal = new prom_client_1.default.Counter({
    name: 'booking_rabbitmq_retry_scheduled_total',
    help: 'Total RabbitMQ retries scheduled into TTL retry queues (booking-service)',
    labelNames: ['queue', 'routingKey', 'eventType', 'delayMs', 'nextRetry'],
});
exports.bookingLifecycleDurationSeconds = new prom_client_1.default.Histogram({
    name: 'booking_lifecycle_duration_seconds',
    help: 'Booking lifecycle duration in seconds for key transitions (booking-service)',
    labelNames: ['transition'],
    buckets: [0.5, 1, 2.5, 5, 10, 30, 60, 120, 300, 600, 1800, 3600, 7200],
});
exports.bookingOutboxPublishedTotal = new prom_client_1.default.Counter({
    name: 'booking_outbox_published_total',
    help: 'Total outbox rows successfully published to RabbitMQ (booking-service)',
    labelNames: ['routingKey'],
});
exports.bookingOutboxPublishErrorsTotal = new prom_client_1.default.Counter({
    name: 'booking_outbox_publish_errors_total',
    help: 'Total outbox publishing errors (booking-service)',
});
exports.bookingOutboxPending = new prom_client_1.default.Gauge({
    name: 'booking_outbox_pending',
    help: 'Current number of pending outbox rows (published=false) (booking-service)',
});
exports.bookingOutboxBatchSize = new prom_client_1.default.Histogram({
    name: 'booking_outbox_batch_size',
    help: 'Outbox batch sizes read by the publisher (booking-service)',
    buckets: [0, 1, 5, 10, 25, 50, 100, 200],
});
exports.bookingOutboxPublishDurationSeconds = new prom_client_1.default.Histogram({
    name: 'booking_outbox_publish_duration_seconds',
    help: 'Outbox publish+mark duration in seconds per message (booking-service)',
    labelNames: ['routingKey'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
register.registerMetric(exports.bookingCreateCounter);
register.registerMetric(exports.bookingRabbitConsumeTotal);
register.registerMetric(exports.bookingRabbitConsumeDurationSeconds);
register.registerMetric(exports.bookingRabbitRetryReceivedTotal);
register.registerMetric(exports.bookingRabbitRetryScheduledTotal);
register.registerMetric(exports.bookingLifecycleDurationSeconds);
register.registerMetric(exports.bookingOutboxPublishedTotal);
register.registerMetric(exports.bookingOutboxPublishErrorsTotal);
register.registerMetric(exports.bookingOutboxPending);
register.registerMetric(exports.bookingOutboxBatchSize);
register.registerMetric(exports.bookingOutboxPublishDurationSeconds);
exports.default = register;
//# sourceMappingURL=metrics.js.map