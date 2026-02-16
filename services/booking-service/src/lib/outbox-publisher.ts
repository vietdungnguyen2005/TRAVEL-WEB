import prisma from './prisma';
import { Logger, rabbitConnect } from '@travel-web/shared';
import {
    bookingOutboxBatchSize,
    bookingOutboxPublishDurationSeconds,
    bookingOutboxPublishErrorsTotal,
    bookingOutboxPublishedTotal,
} from './metrics';

const logger = new Logger('OutboxPublisher');

function getNumberEnv(name: string, defaultValue: number) {
    const raw = process.env[name];
    const parsed = raw ? Number(raw) : defaultValue;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function toRoutingKey(aggregateType: string, eventType: string) {
    const agg = aggregateType.trim().toLowerCase();
    const evt = eventType.trim();

    // Backward compatibility: BookingCreated -> booking.created
    const normalized = evt
        .replace(/^Booking/i, '')
        .replace(/^Payment/i, '')
        .replace(/^[._-]+/, '')
        .replace(/([a-z])([A-Z])/g, '$1.$2')
        .replace(/[\s_]+/g, '.')
        .toLowerCase();

    // If eventType already looks like 'created'/'confirmed'...
    if (!normalized.includes('.')) {
        return `${agg}.${normalized}`;
    }
    // If eventType is already namespaced (starts with '<agg>.'), keep it; otherwise prefix.
    if (normalized.startsWith(`${agg}.`)) return normalized;
    return `${agg}.${normalized}`;
}

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

    const { channel: ch, exchange } = await rabbitConnect({ url: RABBIT_URL });
    if (!ch) throw new Error('RabbitMQ channel not initialized');

    logger.info('Outbox publisher started');

    const batchSize = getNumberEnv('OUTBOX_BATCH_SIZE', 50);
    const basePollMs = getNumberEnv('OUTBOX_POLL_INTERVAL_MS', 500);
    const idlePollMs = getNumberEnv('OUTBOX_IDLE_POLL_INTERVAL_MS', 1500);
    const maxBackoffMs = getNumberEnv('OUTBOX_MAX_BACKOFF_MS', 15000);

    let backoffMs = basePollMs;

    // Polling loop (simple + safe defaults). For higher throughput:
    // - run multiple publishers with SKIP LOCKED (requires a lock column)
    // - increase batch size and use confirm channels
    while (true) {
        try {
            const outboxes = await prisma.outbox.findMany({
                where: { published: false },
                take: batchSize,
                orderBy: { createdAt: 'asc' },
            });

            bookingOutboxBatchSize.observe(outboxes.length);

            if (outboxes.length === 0) {
                backoffMs = basePollMs;
                await new Promise((r) => setTimeout(r, idlePollMs));
                continue;
            }

            for (const o of outboxes) {
                const endTimer = bookingOutboxPublishDurationSeconds.startTimer();
                const routingKey = toRoutingKey(o.aggregateType, o.eventType);
                const payload = Buffer.from(JSON.stringify(o.payload));

                // Use outbox id as messageId so consumers can do idempotency.
                ch.publish(exchange, routingKey, payload, {
                    persistent: true,
                    contentType: 'application/json',
                    messageId: o.id,
                    timestamp: Math.floor(Date.now() / 1000),
                });

                await prisma.outbox.update({
                    where: { id: o.id },
                    data: { published: true, publishedAt: new Date() },
                });
                bookingOutboxPublishedTotal.inc({ routingKey });
                endTimer({ routingKey });
                logger.info('Published outbox', { id: o.id, routingKey });
            }

            backoffMs = basePollMs;
        } catch (err) {
            logger.error('Outbox publish error', err as Error);

            bookingOutboxPublishErrorsTotal.inc();

            backoffMs = Math.min(maxBackoffMs, Math.floor(backoffMs * 1.8));
            await new Promise((r) => setTimeout(r, backoffMs));
        }

        await new Promise((r) => setTimeout(r, basePollMs));
    }
}

export default publishOutbox;
