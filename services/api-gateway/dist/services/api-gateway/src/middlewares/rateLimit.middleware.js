"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("redis");
let redisClient = null;
async function getRedisClient() {
    if (redisClient)
        return redisClient;
    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error('REDIS_URL is not set');
    }
    const client = (0, redis_1.createClient)({ url });
    client.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.error('[rate-limit] redis error', err);
    });
    await client.connect();
    redisClient = client;
    return client;
}
function isProd() {
    return process.env.NODE_ENV === 'production';
}
const rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    store: isProd()
        ? new rate_limit_redis_1.default({
            // rate-limit-redis expects a sendCommand function.
            sendCommand: async (...args) => {
                const client = await getRedisClient();
                return await client.sendCommand(args);
            },
        })
        : undefined,
});
exports.rateLimitMiddleware = rateLimitMiddleware;
// Hard requirement: in production do not use in-memory limiter.
if (isProd() && !process.env.REDIS_URL) {
    throw new Error('Production rate limiting requires REDIS_URL (Redis-backed store)');
}
//# sourceMappingURL=rateLimit.middleware.js.map