import Redis from 'ioredis';
export declare function getRedisClient(): Redis | null;
export declare function redisGetJson<T>(key: string): Promise<T | null>;
export declare function redisSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void>;
export declare function rateLimitFixedWindow(opts: {
    key: string;
    limit: number;
    windowSeconds: number;
}): Promise<{
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
    count: number;
}>;
//# sourceMappingURL=redis.d.ts.map