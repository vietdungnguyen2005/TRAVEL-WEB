"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertBookingQueueTopology = assertBookingQueueTopology;
const shared_1 = require("@travel-web/shared");
async function assertBookingQueueTopology() {
    const exchange = process.env.RABBITMQ_EXCHANGE || 'events';
    const dlx = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';
    const retryExchange = process.env.RABBITMQ_RETRY_EXCHANGE || 'retry';
    const paymentQueue = process.env.RABBITMQ_QUEUE_PAYMENT_EVENTS || 'booking-service.payment-events';
    // Retry queues: 5s, 30s, 5m.
    const retryDelaysMs = [5000, 30000, 300000];
    await (0, shared_1.rabbitAssertTopology)({
        exchange: { name: exchange, type: 'topic' },
        dlx: { exchange: { name: dlx, type: 'topic' } },
        queues: [
            {
                name: paymentQueue,
                options: {
                    durable: true,
                    arguments: {
                        'x-dead-letter-exchange': dlx,
                        'x-dead-letter-routing-key': `${paymentQueue}.dlq`,
                    },
                },
                bindings: [
                    { exchange, routingKey: 'payment.completed' },
                ],
            },
            {
                name: `${paymentQueue}.dlq`,
                options: { durable: true },
                bindings: [{ exchange: dlx, routingKey: `${paymentQueue}.dlq` }],
            },
        ],
        retry: {
            exchange: { name: retryExchange, type: 'topic' },
            queues: retryDelaysMs.map((ttlMs) => ({
                name: `${paymentQueue}.retry.${ttlMs}`,
                ttlMs,
                deadLetterExchange: exchange,
                // Single binding key; retries always come back as payment.completed.
                deadLetterRoutingKey: 'payment.completed',
                bindings: [{ exchange: retryExchange, routingKey: `${paymentQueue}.retry.${ttlMs}` }],
            })),
        },
    });
}
//# sourceMappingURL=queue-topology.js.map