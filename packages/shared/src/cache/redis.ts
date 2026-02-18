import Redis from 'ioredis';

import { Logger } from '../logger';

const logger = new Logger('Redis');

let client: Redis | null = null;

export function getRedisClient(): Redis | null {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    if (client) return client;

    client = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: true,
    });

    client.on('error', (err) => {
        logger.error('Redis client error', err as Error);
    });

    return client;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;
    const raw = await redis.get(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export async function redisSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;
    const payload = JSON.stringify(value);
    const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? Math.floor(ttlSeconds) : 0;
    if (ttl > 0) {
        await redis.set(key, payload, 'EX', ttl);
        return;
    }
    await redis.set(key, payload);
}

export async function rateLimitFixedWindow(opts: {
    key: string;
    limit: number;
    windowSeconds: number;
}): Promise<{ allowed: boolean; remaining: number; resetSeconds: number; count: number }> {
    const redis = getRedisClient();
    if (!redis) {
        // If Redis isn't configured, fail-open (so local dev keeps working).
        return { allowed: true, remaining: opts.limit, resetSeconds: opts.windowSeconds, count: 0 };
    }

    const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? Math.floor(opts.limit) : 1;
    const windowSeconds = Number.isFinite(opts.windowSeconds) && opts.windowSeconds > 0 ? Math.floor(opts.windowSeconds) : 60;

    const count = await redis.incr(opts.key);
    if (count === 1) {
        await redis.expire(opts.key, windowSeconds);
    }

    const ttl = await redis.ttl(opts.key);
    const resetSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : windowSeconds;
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { allowed, remaining, resetSeconds, count };
}
