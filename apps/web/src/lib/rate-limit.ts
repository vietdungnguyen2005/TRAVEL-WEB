import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows requests based on configuration
// For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
// For development without Redis, it will use in-memory store

let ratelimit: any | null = null;

// Simple in-memory limiter shim used in development when Upstash isn't configured.
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

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Production: Use Upstash Redis
    console.log("✅ Rate limiting using Upstash Redis");
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  } else {
    // Development: Use in-memory shim (safe, no Redis methods called)
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
    const { success, reset, remaining } = await limiter.limit(identifier);

    return {
      success,
      remaining,
      resetTime: reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error("Rate limit check failed:", error);
    return {
      success: true,
      remaining: maxRequests,
      resetTime: Date.now() + 60000,
    };
  }
}

// Different rate limits for different endpoints
export const rateLimitPresets = {
  auth: 5, // 5 login attempts per minute
  api: 60, // 60 requests per minute
  upload: 10, // 10 uploads per minute
  payment: 10, // 10 payment attempts per minute
};


/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();

  headers.set('X-RateLimit-Limit', String(result.remaining + 1));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));

  return headers;
}
