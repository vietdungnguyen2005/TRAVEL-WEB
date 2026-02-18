import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
    if (redisClient) return redisClient;

    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error('REDIS_URL is not set');
    }

    const client = createClient({ url });
    client.on('error', (err) => {
        console.error('[rate-limit] redis error', err);
    });

    await client.connect();
    redisClient = client;
    return client;
}

function isProd() {
    return process.env.NODE_ENV === 'production';
}

const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    store: isProd()
        ? new RedisStore({
            // rate-limit-redis expects a sendCommand function.
            sendCommand: async (...args: string[]) => {
                const client = await getRedisClient();
                return await client.sendCommand(args);
            },
        })
        : undefined,
});

// Hard requirement: in production do not use in-memory limiter.
if (isProd() && !process.env.REDIS_URL) {
    throw new Error('Production rate limiting requires REDIS_URL (Redis-backed store)');
}

export { rateLimitMiddleware };
