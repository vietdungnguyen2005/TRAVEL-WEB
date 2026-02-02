import amqp from 'amqplib';
import prisma from './prisma';
import { Logger } from '@travel-web/shared';

const logger = new Logger('OutboxPublisher');
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'events';

async function publishOutbox() {
    // Note: current product requirement is "payment request pending; admin approves".
    // Outbox -> RabbitMQ publishing isn't necessary for local/dev and has been a
    // frequent source of crashes when the outbox table isn't provisioned.
    // Enable explicitly with ENABLE_OUTBOX_PUBLISHER=true.
    if (process.env.ENABLE_OUTBOX_PUBLISHER !== 'true') {
        logger.warn('ENABLE_OUTBOX_PUBLISHER is not true; skipping outbox publisher');
        return;
    }
    if (process.env.DISABLE_RABBITMQ === 'true') {
        logger.warn('DISABLE_RABBITMQ=true; skipping outbox publisher');
        return;
    }
    const RABBIT_URL = process.env.RABBITMQ_URL;
    if (!RABBIT_URL) {
        throw new Error('RABBITMQ_URL is not set');
    }
    const conn = await amqp.connect(RABBIT_URL);
    const ch = await conn.createChannel();
    await ch.assertExchange(EXCHANGE, 'topic', { durable: true });

    logger.info('Outbox publisher started');

    // Simple polling loop
    while (true) {
        try {
            const outboxes = await prisma.outbox.findMany({ where: { published: false }, take: 20, orderBy: { createdAt: 'asc' } });
            for (const o of outboxes) {
                const routingKey = `${o.aggregateType.toLowerCase()}.${o.eventType.toLowerCase()}`;
                const payload = Buffer.from(JSON.stringify(o.payload));
                ch.publish(EXCHANGE, routingKey, payload, { persistent: true });

                await prisma.outbox.update({ where: { id: o.id }, data: { published: true, publishedAt: new Date() } });
                logger.info('Published outbox', { id: o.id, routingKey });
            }
        } catch (err) {
            logger.error('Outbox publish error', err as Error);
            // backoff
            await new Promise((r) => setTimeout(r, 5000));
        }

        // small delay between polls
        await new Promise((r) => setTimeout(r, 1000));
    }
}

export default publishOutbox;
