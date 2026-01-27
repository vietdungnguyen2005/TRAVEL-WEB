"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const prisma_1 = __importDefault(require("./prisma"));
const shared_1 = require("@travel-web/shared");
const logger = new shared_1.Logger('OutboxPublisher');
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'events';
async function publishOutbox() {
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping outbox publisher');
        return;
    }
    const RABBIT_URL = process.env.RABBITMQ_URL;
    if (!RABBIT_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }
    const conn = await amqplib_1.default.connect(RABBIT_URL);
    const ch = await conn.createChannel();
    await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
    logger.info('Outbox publisher started');
    // Simple polling loop
    while (true) {
        try {
            const outboxes = await prisma_1.default.outbox.findMany({ where: { published: false }, take: 20, orderBy: { createdAt: 'asc' } });
            for (const o of outboxes) {
                const routingKey = `${o.aggregateType.toLowerCase()}.${o.eventType.toLowerCase()}`;
                const payload = Buffer.from(JSON.stringify(o.payload));
                ch.publish(EXCHANGE, routingKey, payload, { persistent: true });
                await prisma_1.default.outbox.update({ where: { id: o.id }, data: { published: true, publishedAt: new Date() } });
                logger.info('Published outbox', { id: o.id, routingKey });
            }
        }
        catch (err) {
            logger.error('Outbox publish error', err);
            // backoff
            await new Promise((r) => setTimeout(r, 5000));
        }
        // small delay between polls
        await new Promise((r) => setTimeout(r, 1000));
    }
}
exports.default = publishOutbox;
//# sourceMappingURL=outbox-publisher.js.map