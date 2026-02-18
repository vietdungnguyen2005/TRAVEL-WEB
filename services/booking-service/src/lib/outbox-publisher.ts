import prisma from './prisma';
import { Logger, rabbitConnect } from '@travel-web/shared';
import {
    bookingOutboxBatchSize,
    bookingOutboxPending,
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
    const lockTtlMs = getNumberEnv('OUTBOX_LOCK_TTL_MS', 60_000);
    const publisherId = process.env.OUTBOX_PUBLISHER_ID || process.env.HOSTNAME || `publisher-${Math.random().toString(16).slice(2)}`;

    let backoffMs = basePollMs;

    // Polling loop (simple + safe defaults). For higher throughput:
    // - run multiple publishers with SKIP LOCKED (requires a lock column)
    // - increase batch size and use confirm channels
    while (true) {
        try {
            // Claim rows using SKIP LOCKED so multiple publishers won't double-publish.
            // We keep the DB transaction short: claim -> return rows; publish happens outside.
            const outboxes = await prisma.$transaction(async (tx) => {
                const rows = await (tx as typeof prisma).$queryRaw<Array<{
                    id: string;
                    aggregateType: string;
                    aggregateId: string;
                    eventType: string;
                    payload: unknown;
                    createdAt: Date;
                }>>`
                    WITH cte AS (
                        SELECT "id"
                        FROM "booking"."outbox"
                        WHERE "published" = false
                          AND ("lockExpiresAt" IS NULL OR "lockExpiresAt" < NOW())
                        ORDER BY "createdAt" ASC
                        LIMIT ${batchSize}
                        FOR UPDATE SKIP LOCKED
                    )
                    UPDATE "booking"."outbox" o
                    SET "lockedAt" = NOW(),
                        "lockExpiresAt" = NOW() + (${lockTtlMs} * INTERVAL '1 millisecond'),
                        "lockedBy" = ${publisherId},
                        "publishAttempts" = COALESCE("publishAttempts", 0) + 1,
                        "lastError" = NULL
                    FROM cte
                    WHERE o."id" = cte."id"
                    RETURNING o."id", o."aggregateType", o."aggregateId", o."eventType", o."payload", o."createdAt";
                `;
                return rows;
            });

            bookingOutboxBatchSize.observe(outboxes.length);

            try {
                const pendingCount = await prisma.outbox.count({ where: { published: false } });
                bookingOutboxPending.set(pendingCount);
            } catch {
                // ignore metric count errors
            }

            if (outboxes.length === 0) {
                backoffMs = basePollMs;
                await new Promise((r) => setTimeout(r, idlePollMs));
                continue;
            }

            for (const o of outboxes) {
                const endTimer = bookingOutboxPublishDurationSeconds.startTimer();
                const routingKey = toRoutingKey(o.aggregateType, o.eventType);
                const payload = Buffer.from(JSON.stringify(o.payload));

                const correlationId = (() => {
                    const v = (o.payload as { correlationId?: unknown } | null | undefined)?.correlationId;
                    return typeof v === 'string' && v.trim().length > 0 ? v : undefined;
                })();

                // Use outbox id as messageId so consumers can do idempotency.
                ch.publish(exchange, routingKey, payload, {
                    persistent: true,
                    contentType: 'application/json',
                    messageId: o.id,
                    correlationId,
                    headers: correlationId ? { 'x-correlation-id': correlationId } : undefined,
                    timestamp: Math.floor(Date.now() / 1000),
                });

                try {
                    await prisma.outbox.update({
                        where: { id: o.id },
                        data: { published: true, publishedAt: new Date() },
                    });
                    bookingOutboxPublishedTotal.inc({ routingKey });
                    endTimer({ routingKey });
                    logger.info('Published outbox', { id: o.id, routingKey });
                } catch (err) {
                    // If DB update fails after publish, this can cause duplicates on restart.
                    // Record the error for visibility and let idempotent consumers handle duplicates.
                    const error = err as Error;
                    bookingOutboxPublishErrorsTotal.inc();
                    try {
                        await prisma.outbox.update({
                            where: { id: o.id },
                            data: {
                                published: false,
                                lastError: error.message,
                                // shorten the lock so another publisher can pick it soon
                                lockExpiresAt: new Date(Date.now() + Math.min(15_000, lockTtlMs)),
                            },
                        });
                    } catch {
                        // ignore
                    }
                    endTimer({ routingKey });
                    throw err;
                }
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
