"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitConnect = rabbitConnect;
exports.rabbitAssertTopology = rabbitAssertTopology;
exports.rabbitPublish = rabbitPublish;
exports.rabbitRpc = rabbitRpc;
exports.rabbitConsume = rabbitConsume;
exports.rabbitConsumeWithRetry = rabbitConsumeWithRetry;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../logger");
const node_crypto_1 = require("node:crypto");
const correlation_1 = require("../observability/correlation");
const logger = new logger_1.Logger('RabbitMQ');
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let connection = null;
let channel = null;
let connecting = null;
async function rabbitConnect(config) {
    const url = config?.url || process.env.RABBITMQ_URL;
    const exchange = config?.exchange || process.env.RABBITMQ_EXCHANGE || 'events';
    const dlxExchange = process.env.RABBITMQ_DLX_EXCHANGE || 'dlx';
    if (!url) {
        throw new Error('RABBITMQ_URL is not set');
    }
    if (connection && channel) {
        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertExchange(dlxExchange, 'topic', { durable: true });
        return { connection, channel, url, exchange };
    }
    if (!connecting) {
        connecting = (async () => {
            const timeoutMsRaw = process.env.RABBITMQ_CONNECT_TIMEOUT_MS;
            const timeoutMs = typeof timeoutMsRaw === 'string' && timeoutMsRaw.length > 0 ? Number(timeoutMsRaw) : 30000;
            const start = Date.now();
            let attempt = 0;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                attempt += 1;
                try {
                    const conn = await amqplib_1.default.connect(url);
                    const ch = await conn.createChannel();
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
                    logger.info('RabbitMQ connected', { url, dlxExchange });
                    return { connection: conn, channel: ch };
                }
                catch (err) {
                    const elapsed = Date.now() - start;
                    const remaining = timeoutMs - elapsed;
                    const error = err;
                    if (!(Number.isFinite(timeoutMs) && timeoutMs > 0) || remaining <= 0) {
                        logger.error('RabbitMQ connect failed (giving up)', err);
                        throw err;
                    }
                    const backoffBaseMs = 250;
                    const backoffMaxMs = 5000;
                    const exp = Math.min(backoffMaxMs, backoffBaseMs * Math.pow(2, attempt - 1));
                    const jitter = Math.floor(Math.random() * Math.min(250, exp));
                    const waitMs = Math.min(remaining, exp + jitter);
                    logger.warn('RabbitMQ connect failed; retrying', {
                        attempt,
                        waitMs,
                        code: typeof error.code === 'string' ? error.code : undefined,
                        message: typeof error.message === 'string' ? error.message : undefined,
                    });
                    await sleep(waitMs);
                }
            }
        })();
    }
    try {
        const { connection: conn, channel: ch } = await connecting;
        await ch.assertExchange(exchange, 'topic', { durable: true });
        await ch.assertExchange(dlxExchange, 'topic', { durable: true });
        return { connection: conn, channel: ch, url, exchange };
    }
    finally {
        connecting = null;
    }
}
async function rabbitAssertTopology(topology) {
    const { channel: ch } = await rabbitConnect({ exchange: topology.exchange.name });
    if (!ch)
        throw new Error('RabbitMQ channel not initialized');
    const exchangeType = topology.exchange.type || 'topic';
    await ch.assertExchange(topology.exchange.name, exchangeType, { durable: true, ...(topology.exchange.options || {}) });
    if (topology.dlx) {
        const dlxType = topology.dlx.exchange.type || 'topic';
        await ch.assertExchange(topology.dlx.exchange.name, dlxType, { durable: true, ...(topology.dlx.exchange.options || {}) });
    }
    if (topology.retry) {
        const retryType = topology.retry.exchange.type || 'topic';
        await ch.assertExchange(topology.retry.exchange.name, retryType, { durable: true, ...(topology.retry.exchange.options || {}) });
        for (const q of topology.retry.queues) {
            await ch.assertQueue(q.name, {
                durable: true,
                arguments: {
                    'x-message-ttl': q.ttlMs,
                    'x-dead-letter-exchange': q.deadLetterExchange,
                    'x-dead-letter-routing-key': q.deadLetterRoutingKey,
                },
                ...(q.options || {}),
            });
            for (const b of q.bindings) {
                await ch.bindQueue(q.name, b.exchange, b.routingKey);
            }
        }
    }
    for (const q of topology.queues) {
        await ch.assertQueue(q.name, { durable: true, ...(q.options || {}) });
        for (const b of q.bindings) {
            await ch.bindQueue(q.name, b.exchange, b.routingKey);
        }
    }
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
    const correlationId = (0, correlation_1.ensureCorrelationId)(options?.correlationId);
    ch.publish(exchange, routingKey, content, {
        persistent: true,
        contentType: 'application/json',
        ...options,
        correlationId,
    });
}
async function rabbitRpc({ routingKey, message, timeoutMs = 5000, options }) {
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch)
        throw new Error('RabbitMQ channel not initialized');
    const { queue: replyQueue } = await ch.assertQueue('', { exclusive: true, autoDelete: true });
    const correlationId = typeof options?.correlationId === 'string' && options.correlationId.length > 0
        ? options.correlationId
        : (0, node_crypto_1.randomUUID)();
    return await new Promise((resolve, reject) => {
        let timeout = null;
        ch.consume(replyQueue, (msg) => {
            if (!msg)
                return;
            if (msg.properties.correlationId !== correlationId) {
                ch.ack(msg);
                return;
            }
            try {
                const body = msg.content.toString('utf-8');
                const payload = body ? JSON.parse(body) : null;
                ch.ack(msg);
                if (timeout)
                    clearTimeout(timeout);
                resolve(payload);
            }
            catch (err) {
                ch.ack(msg);
                if (timeout)
                    clearTimeout(timeout);
                reject(err);
            }
        }, { noAck: false }).catch(reject);
        timeout = setTimeout(() => reject(new Error(`RPC timeout after ${timeoutMs}ms`)), timeoutMs);
        const content = Buffer.from(JSON.stringify(message));
        ch.publish(exchange, routingKey, content, {
            persistent: true,
            contentType: 'application/json',
            correlationId,
            replyTo: replyQueue,
            ...options,
        });
    });
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
        const correlationId = (0, correlation_1.ensureCorrelationId)((typeof msg.properties.correlationId === 'string' && msg.properties.correlationId.trim())
            ? msg.properties.correlationId
            : msg.properties.headers?.['x-correlation-id']);
        await (0, correlation_1.runWithCorrelationId)(correlationId, async () => {
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
        });
    }, { consumerTag: opts.consumerTag });
}
function getRetryCount(msg) {
    const headers = msg.properties.headers;
    const raw = headers?.['x-retry-count'];
    const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
async function rabbitConsumeWithRetry(opts, handler) {
    const enableRetry = opts.enableRetry !== false;
    const maxRetries = typeof opts.maxRetries === 'number' && opts.maxRetries >= 0 ? opts.maxRetries : 3;
    const retryDelaysMs = (opts.retryDelaysMs && opts.retryDelaysMs.length > 0 ? opts.retryDelaysMs : [1000, 10000, 60000])
        .filter((n) => Number.isFinite(n) && n > 0);
    const retryExchange = opts.retryExchange || process.env.RABBITMQ_RETRY_EXCHANGE || 'retry';
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch)
        throw new Error('RabbitMQ channel not initialized');
    if (enableRetry) {
        await ch.assertExchange(retryExchange, 'topic', { durable: true });
    }
    await rabbitConsume(opts, async (payload, raw) => {
        try {
            await handler(payload, raw);
        }
        catch (err) {
            const currentRetry = getRetryCount(raw);
            if (!enableRetry || currentRetry >= Math.min(maxRetries, retryDelaysMs.length)) {
                throw err;
            }
            const nextRetry = currentRetry + 1;
            const delayMs = retryDelaysMs[nextRetry - 1];
            const error = err;
            logger.warn('RabbitMQ handler failed; scheduling retry', {
                queue: opts.queue,
                routingKey: raw.fields.routingKey,
                messageId: raw.properties.messageId,
                currentRetry,
                nextRetry,
                delayMs,
                reason: error?.message,
            });
            // Publish into a retry queue (expected to have TTL + DLX back to main exchange).
            const retryRoutingKey = `${opts.queue}.retry.${delayMs}`;
            const content = raw.content;
            try {
                opts.onRetryScheduled?.({
                    queue: opts.queue,
                    routingKey: raw.fields.routingKey,
                    messageId: typeof raw.properties.messageId === 'string' ? raw.properties.messageId : undefined,
                    correlationId: typeof raw.properties.correlationId === 'string' ? raw.properties.correlationId : undefined,
                    currentRetry,
                    nextRetry,
                    delayMs,
                });
            }
            catch {
                // never block message handling on metrics
            }
            ch.publish(retryExchange, retryRoutingKey, content, {
                persistent: true,
                contentType: raw.properties.contentType || 'application/json',
                messageId: raw.properties.messageId,
                correlationId: raw.properties.correlationId,
                headers: {
                    ...(raw.properties.headers || {}),
                    'x-retry-count': nextRetry,
                    'x-retry-delay-ms': delayMs,
                    'x-retry-reason': error?.message,
                    'x-original-exchange': exchange,
                    'x-original-routing-key': raw.fields.routingKey,
                },
            });
            // Ack original so it doesn't go to DLQ yet.
            ch.ack(raw);
            return;
        }
    });
}
//# sourceMappingURL=rabbitmq.js.map