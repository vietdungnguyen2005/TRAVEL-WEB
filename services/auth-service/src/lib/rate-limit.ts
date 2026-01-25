import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: any | null = null;

class SimpleMemoryLimiter {
    private store: Map<string, { count: number; reset: number }>;
    private max: number;
    private windowMs: number;

    constructor(max = 60, windowMs = 60 * 1000) {
        this.store = new Map();
        this.max = max;
        this.windowMs = windowMs;
    }

    async limit(identifier: string) {
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
    if (ratelimit) return ratelimit;

    // Only use Upstash Redis in production and when env vars are present.
    if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log("✅ Rate limiting using Upstash Redis");
        ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(60, "1 m"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });
    } else {
        console.warn("⚠️ Rate limiting using in-memory store (development only)");
        ratelimit = new SimpleMemoryLimiter(60, 60 * 1000);
    }

    return ratelimit;
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxRequests - Max requests allowed
 * @returns RateLimitResult
 */
export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 60
): Promise<RateLimitResult> {
    try {
        const limiter = getRateLimiter();
        const { success, limit, reset, remaining } = await limiter.limit(identifier);

        return {
            success,
            remaining,
            resetTime: reset,
        };
    } catch (error) {
        console.error("Rate limit error:", error);
        return {
            success: true,
            remaining: maxRequests,
            resetTime: Date.now() + 60000, // Default to 1 minute
        };
    }
}
