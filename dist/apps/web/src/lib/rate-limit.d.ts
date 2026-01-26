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
export declare function checkRateLimit(identifier: string, maxRequests?: number): Promise<RateLimitResult>;
export declare const rateLimitPresets: {
    auth: number;
    api: number;
    upload: number;
    payment: number;
};
/**
 * Get client IP from request
 */
export declare function getClientIp(request: Request): string;
/**
 * Create rate limit response headers
 */
export declare function createRateLimitHeaders(result: RateLimitResult): Headers;
//# sourceMappingURL=rate-limit.d.ts.map