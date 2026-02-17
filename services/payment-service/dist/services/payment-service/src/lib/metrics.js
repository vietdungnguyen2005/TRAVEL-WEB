"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRabbitPublishDurationSeconds = exports.paymentRabbitPublishTotal = exports.paymentRabbitConsumeDurationSeconds = exports.paymentRabbitConsumeTotal = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
exports.paymentRabbitConsumeTotal = new prom_client_1.default.Counter({
    name: 'payment_rabbitmq_consume_total',
    help: 'Total RabbitMQ messages consumed by payment-service',
    labelNames: ['queue', 'routingKey', 'eventType', 'status'],
});
exports.paymentRabbitConsumeDurationSeconds = new prom_client_1.default.Histogram({
    name: 'payment_rabbitmq_consume_duration_seconds',
    help: 'RabbitMQ message handler duration in seconds (payment-service)',
    labelNames: ['queue', 'routingKey', 'eventType'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
exports.paymentRabbitPublishTotal = new prom_client_1.default.Counter({
    name: 'payment_rabbitmq_publish_total',
    help: 'Total RabbitMQ messages published by payment-service',
    labelNames: ['routingKey', 'status'],
});
exports.paymentRabbitPublishDurationSeconds = new prom_client_1.default.Histogram({
    name: 'payment_rabbitmq_publish_duration_seconds',
    help: 'RabbitMQ publish duration in seconds (payment-service)',
    labelNames: ['routingKey'],
    buckets: [0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});
exports.register.registerMetric(exports.paymentRabbitConsumeTotal);
exports.register.registerMetric(exports.paymentRabbitConsumeDurationSeconds);
exports.register.registerMetric(exports.paymentRabbitPublishTotal);
exports.register.registerMetric(exports.paymentRabbitPublishDurationSeconds);
exports.default = exports.register;
//# sourceMappingURL=metrics.js.map