"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.redisGetJson = redisGetJson;
exports.redisSetJson = redisSetJson;
exports.rateLimitFixedWindow = rateLimitFixedWindow;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../logger");
const logger = new logger_1.Logger('Redis');
let client = null;
function getRedisClient() {
    const url = process.env.REDIS_URL;
    if (!url)
        return null;
    if (client)
        return client;
    client = new ioredis_1.default(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: true,
    });
    client.on('error', (err) => {
        logger.error('Redis client error', err);
    });
    return client;
}
async function redisGetJson(key) {
    const redis = getRedisClient();
    if (!redis)
        return null;
    const raw = await redis.get(key);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
async function redisSetJson(key, value, ttlSeconds) {
    const redis = getRedisClient();
    if (!redis)
        return;
    const payload = JSON.stringify(value);
    const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? Math.floor(ttlSeconds) : 0;
    if (ttl > 0) {
        await redis.set(key, payload, 'EX', ttl);
        return;
    }
    await redis.set(key, payload);
}
async function rateLimitFixedWindow(opts) {
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
//# sourceMappingURL=redis.js.map