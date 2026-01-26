module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "createRateLimitHeaders",
    ()=>createRateLimitHeaders,
    "getClientIp",
    ()=>getClientIp,
    "rateLimitPresets",
    ()=>rateLimitPresets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$ratelimit$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@upstash/ratelimit/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@upstash/redis/nodejs.mjs [app-route] (ecmascript) <locals>");
;
;
// Create a new ratelimiter that allows requests based on configuration
// For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
// For development without Redis, it will use in-memory store
let ratelimit = null;
// Simple in-memory limiter shim used in development when Upstash isn't configured.
class SimpleMemoryLimiter {
    store;
    max;
    windowMs;
    constructor(max = 60, windowMs = 60 * 1000){
        this.store = new Map();
        this.max = max;
        this.windowMs = windowMs;
    }
    async limit(identifier) {
        const now = Date.now();
        const entry = this.store.get(identifier);
        if (!entry || now > entry.reset) {
            const reset = now + this.windowMs;
            this.store.set(identifier, {
                count: 1,
                reset
            });
            return {
                success: true,
                limit: this.max,
                remaining: this.max - 1,
                reset
            };
        }
        entry.count += 1;
        const success = entry.count <= this.max;
        const remaining = Math.max(0, this.max - entry.count);
        return {
            success,
            limit: this.max,
            remaining,
            reset: entry.reset
        };
    }
}
function getRateLimiter() {
    if (ratelimit) return ratelimit;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        // Production: Use Upstash Redis
        console.log("✅ Rate limiting using Upstash Redis");
        ratelimit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$ratelimit$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Ratelimit"]({
            redis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"].fromEnv(),
            limiter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$ratelimit$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Ratelimit"].slidingWindow(60, "1 m"),
            analytics: true,
            prefix: "@upstash/ratelimit"
        });
    } else {
        // Development: Use in-memory shim (safe, no Redis methods called)
        console.warn("⚠️ Rate limiting using in-memory store (development only)");
        ratelimit = new SimpleMemoryLimiter(60, 60 * 1000);
    }
    return ratelimit;
}
async function checkRateLimit(identifier, maxRequests = 60) {
    try {
        const limiter = getRateLimiter();
        const { success, limit, reset, remaining } = await limiter.limit(identifier);
        return {
            success,
            remaining,
            resetTime: reset
        };
    } catch (error) {
        // If rate limiting fails, allow the request (fail open)
        console.error("Rate limit check failed:", error);
        return {
            success: true,
            remaining: maxRequests,
            resetTime: Date.now() + 60000
        };
    }
}
const rateLimitPresets = {
    auth: 5,
    api: 60,
    upload: 10,
    payment: 10
};
function getClientIp(request) {
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
function createRateLimitHeaders(result) {
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(result.remaining + 1));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));
    return headers;
}
}),
"[project]/apps/web/src/lib/gateway.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gatewayFetch",
    ()=>gatewayFetch,
    "getGatewayBaseUrl",
    ()=>getGatewayBaseUrl
]);
function getGatewayBaseUrl() {
    return process.env.API_GATEWAY_URL || 'http://localhost:4000';
}
async function gatewayFetch(req, path, init) {
    const baseUrl = getGatewayBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init?.headers);
    // Forward auth context if available.
    if (req) {
        const auth = req.headers.get('authorization');
        const cookie = req.headers.get('cookie');
        if (auth && !headers.has('authorization')) headers.set('authorization', auth);
        if (cookie && !headers.has('cookie')) headers.set('cookie', cookie);
    }
    // Ensure JSON by default when body is objectified upstream.
    if (!headers.has('accept')) headers.set('accept', 'application/json');
    return fetch(url, {
        ...init,
        headers,
        // Don't cache API calls by default in route handlers.
        cache: 'no-store'
    });
}
}),
"[project]/apps/web/src/app/api/auth/register/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gateway.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        // Rate limiting: 5 registrations per IP per hour
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(`register:${ip}`, 5);
        if (!rateLimitResult.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Too many registration attempts. Please try again later."
            }, {
                status: 429
            });
        }
        const body = await request.json();
        const upstream = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gatewayFetch"])(request, '/api/auth/register', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const text = await upstream.text();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](text, {
            status: upstream.status,
            headers: {
                'content-type': upstream.headers.get('content-type') || 'application/json'
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Đã có lỗi xảy ra"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1887d8a1._.js.map