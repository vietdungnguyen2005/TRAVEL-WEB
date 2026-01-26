import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
let ratelimit = null;
class SimpleMemoryLimiter {
    store;
    max;
    windowMs;
    constructor(max = 60, windowMs = 60 * 1000) {
        this.store = new Map();
        this.max = max;
        this.windowMs = windowMs;
    }
    async limit(identifier) {
        const now = Date.now();
        const entry = this.store.get(identifier);
        if (!entry || now > entry.reset) {
            const reset = now + this.windowMs;
            this.store.set(identifier, { count: 1, reset });
            return {
                success: true,
                limit: this.max,
                remaining: this.max - 1,
                reset,
            };
        }
        entry.count += 1;
        const success = entry.count <= this.max;
        const remaining = Math.max(0, this.max - entry.count);
        return {
            success,
            limit: this.max,
            remaining,
            reset: entry.reset,
        };
    }
}
function getRateLimiter() {
    if (ratelimit)
        return ratelimit;
    // Only use Upstash Redis in production and when env vars are present.
    if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log("✅ Rate limiting using Upstash Redis");
        ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(60, "1 m"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });
    }
    else {
        console.warn("⚠️ Rate limiting using in-memory store (development only)");
        ratelimit = new SimpleMemoryLimiter(60, 60 * 1000);
    }
    return ratelimit;
}
/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxRequests - Max requests allowed
 * @returns RateLimitResult
 */
export async function checkRateLimit(identifier, maxRequests = 60) {
    try {
        const limiter = getRateLimiter();
        const { success, limit, reset, remaining } = await limiter.limit(identifier);
        return {
            success,
            remaining,
            resetTime: reset,
        };
    }
    catch (error) {
        console.error("Rate limit error:", error);
        return {
            success: true,
            remaining: maxRequests,
            resetTime: Date.now() + 60000, // Default to 1 minute
        };
    }
}
//# sourceMappingURL=rate-limit.js.map