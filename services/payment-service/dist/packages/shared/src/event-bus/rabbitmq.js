"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitConnect = rabbitConnect;
exports.rabbitPublish = rabbitPublish;
exports.rabbitConsume = rabbitConsume;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../logger");
const logger = new logger_1.Logger('RabbitMQ');
let connection = null;
let channel = null;
async function rabbitConnect(config) {
    const url = config?.url || process.env.RABBITMQ_URL;
    const exchange = config?.exchange || process.env.RABBITMQ_EXCHANGE || 'events';
    const dlxExchange = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';
    if (!url) {
        throw new Error('RABBITMQ_URL is not set');
    }
    if (connection && channel)
        return { connection, channel, url, exchange };
    const conn = await amqplib_1.default.connect(url);
    const ch = await conn.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });
    await ch.assertExchange(dlxExchange, 'topic', { durable: true });
    connection = conn;
    channel = ch;
    conn.on('error', (err) => {
        logger.error('RabbitMQ connection error', err);
    });
    conn.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        connection = null;
        channel = null;
    });
    logger.info('RabbitMQ connected', { url, exchange, dlxExchange });
    return { connection, channel, url, exchange };
}
function safePreview(value, maxChars = 2000) {
    try {
        const s = typeof value === 'string' ? value : JSON.stringify(value);
        if (s.length <= maxChars)
            return s;
        return `${s.slice(0, maxChars)}…(truncated)`;
    }
    catch {
        return '[unserializable]';
    }
}
async function rabbitPublish({ routingKey, message, options }) {
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch)
        throw new Error('RabbitMQ channel not initialized');
    const content = Buffer.from(JSON.stringify(message));
    ch.publish(exchange, routingKey, content, { persistent: true, contentType: 'application/json', ...options });
}
async function rabbitConsume(opts, handler) {
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch)
        throw new Error('RabbitMQ channel not initialized');
    const enableDlq = opts.enableDlq !== false;
    const dlxExchange = opts.deadLetterExchange || process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';
    const dlqQueue = opts.deadLetterQueue || `${opts.queue}.dlq`;
    const dlqRoutingKey = opts.deadLetterRoutingKey || `${opts.queue}.dlq`;
    if (enableDlq) {
        // Per-queue DLQ bound to a shared DLX exchange.
        await ch.assertExchange(dlxExchange, 'topic', { durable: true });
        await ch.assertQueue(dlqQueue, { durable: true });
        await ch.bindQueue(dlqQueue, dlxExchange, dlqRoutingKey);
    }
    // IMPORTANT: queue arguments are immutable in RabbitMQ. If the queue already exists without DLQ,
    // you must delete/recreate it to enable dead-lettering.
    await ch.assertQueue(opts.queue, {
        durable: true,
        arguments: enableDlq
            ? {
                'x-dead-letter-exchange': dlxExchange,
                'x-dead-letter-routing-key': dlqRoutingKey,
            }
            : undefined,
    });
    for (const key of opts.bindingKeys) {
        await ch.bindQueue(opts.queue, exchange, key);
    }
    if (opts.prefetch)
        ch.prefetch(opts.prefetch);
    logger.info('RabbitMQ consumer starting', { queue: opts.queue, bindingKeys: opts.bindingKeys });
    await ch.consume(opts.queue, async (msg) => {
        if (!msg)
            return;
        try {
            const body = msg.content.toString('utf-8');
            const payload = body ? JSON.parse(body) : null;
            await handler(payload, msg);
            ch.ack(msg);
        }
        catch (err) {
            const error = err;
            const body = msg.content.toString('utf-8');
            logger.error('RabbitMQ handler failed', error);
            logger.warn('RabbitMQ message dead-lettering', {
                queue: opts.queue,
                dlxExchange: enableDlq ? dlxExchange : undefined,
                dlqQueue: enableDlq ? dlqQueue : undefined,
                dlqRoutingKey: enableDlq ? dlqRoutingKey : undefined,
                routingKey: msg.fields.routingKey,
                deliveryTag: msg.fields.deliveryTag,
                redelivered: msg.fields.redelivered,
                properties: {
                    messageId: msg.properties.messageId,
                    correlationId: msg.properties.correlationId,
                    timestamp: msg.properties.timestamp,
                    headers: msg.properties.headers,
                },
                payloadPreview: safePreview(body),
                errorMessage: error.message,
            });
            // Requeue=false to avoid poison message infinite loops.
            // If DLQ is enabled on the queue, this rejection will dead-letter the message.
            ch.nack(msg, false, false);
        }
    }, { consumerTag: opts.consumerTag });
}
//# sourceMappingURL=rabbitmq.js.map