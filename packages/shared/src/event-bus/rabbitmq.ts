import amqp, { Channel, ChannelModel, ConsumeMessage, Options } from 'amqplib';
import { Logger } from '../logger';

const logger = new Logger('RabbitMQ');

export type RabbitMqConfig = {
    url: string;
    exchange: string;
};

export type PublishOptions = {
    routingKey: string;
    message: unknown;
    options?: Options.Publish;
};

export type ConsumeOptions = {
    queue: string;
    bindingKeys: string[];
    prefetch?: number;
    consumerTag?: string;
};

export type ConsumeHandler = (payload: any, raw: ConsumeMessage) => Promise<void> | void;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function rabbitConnect(config?: Partial<RabbitMqConfig>) {
    const url = config?.url || process.env.RABBITMQ_URL || 'amqp://localhost';
    const exchange = config?.exchange || process.env.RABBITMQ_EXCHANGE || 'events';

    if (connection && channel) return { connection, channel, url, exchange };

    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });

    connection = conn;
    channel = ch;

    conn.on('error', (err) => {
        logger.error('RabbitMQ connection error', err as Error);
    });
    conn.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        connection = null;
        channel = null;
    });

    logger.info('RabbitMQ connected', { url, exchange });
    return { connection, channel, url, exchange };
}

export async function rabbitPublish({ routingKey, message, options }: PublishOptions) {
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch) throw new Error('RabbitMQ channel not initialized');
    const content = Buffer.from(JSON.stringify(message));
    ch.publish(exchange, routingKey, content, { persistent: true, contentType: 'application/json', ...options });
}

export async function rabbitConsume(opts: ConsumeOptions, handler: ConsumeHandler) {
    const { channel: ch, exchange } = await rabbitConnect();
    if (!ch) throw new Error('RabbitMQ channel not initialized');

    await ch.assertQueue(opts.queue, { durable: true });
    for (const key of opts.bindingKeys) {
        await ch.bindQueue(opts.queue, exchange, key);
    }
    if (opts.prefetch) ch.prefetch(opts.prefetch);

    logger.info('RabbitMQ consumer starting', { queue: opts.queue, bindingKeys: opts.bindingKeys });

    await ch.consume(
        opts.queue,
        async (msg) => {
            if (!msg) return;
            try {
                const body = msg.content.toString('utf-8');
                const payload = body ? JSON.parse(body) : null;
                await handler(payload, msg);
                ch.ack(msg);
            } catch (err) {
                logger.error('RabbitMQ handler failed', err as Error);
                // Requeue=false to avoid poison message infinite loops.
                ch.nack(msg, false, false);
            }
        },
        { consumerTag: opts.consumerTag },
    );
}
