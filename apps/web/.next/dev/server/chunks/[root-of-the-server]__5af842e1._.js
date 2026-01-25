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
"[project]/apps/web/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createRoomType",
    ()=>createRoomType,
    "findAllRoomTypes",
    ()=>findAllRoomTypes,
    "findRoomTypes",
    ()=>findRoomTypes,
    "findRoomTypesWithRooms",
    ()=>findRoomTypesWithRooms,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Lazy singleton holder for Prisma Client + pool. We avoid creating the
// pool/client eagerly on module import because Next's prerender and build
// can import this module even when a DB isn't available. Instead we try to
// create the real client on first use and fall back to a safe stub if the
// DB is unreachable or SKIP_DB_ON_BUILD is set.
const globalForPrisma = globalThis;
async function buildRealPrisma() {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
    const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
        connectionString: process.env.DATABASE_URL
    });
    const AdapterCtor = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"].PrismaPg ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"].default ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"];
    const adapter = new AdapterCtor(pool);
    const client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'query',
            'error',
            'warn'
        ] : "TURBOPACK unreachable"
    });
    // store singletons so subsequent calls reuse them
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
    globalForPrisma.initialized = true;
    return client;
}
function makeStubClient() {
    // generic stub that returns safe defaults for common Prisma model methods
    // The stub returns model proxies: makeStubClient().booking.findMany() etc.
    const modelHandler = {
        get (_, method) {
            return async (..._args)=>{
                if (method === 'findMany') return [];
                if (method === 'findUnique' || method === 'findFirst' || method === 'findOne') return null;
                if (method === 'count') return 0;
                if (method === 'aggregate') return {
                    _sum: {
                        totalPrice: 0
                    },
                    _avg: {},
                    _count: {}
                };
                if (method === 'groupBy') return [];
                if (method === 'create' || method === 'update' || method === 'upsert' || method === 'delete') return null;
                if (method === '$queryRaw' || method === '$executeRaw') return [];
                if (method === '$transaction') {
                    return async (cb)=>{
                        if (typeof cb === 'function') return cb(makeStubClient());
                        return [];
                    };
                }
                return async ()=>undefined;
            };
        }
    };
    const rootHandler = {
        get (_, _modelName) {
            // Return a proxy representing the model with methods
            return new Proxy({}, modelHandler);
        }
    };
    return new Proxy({}, rootHandler);
}
const prisma = new Proxy({}, {
    get (_target, prop) {
        // If DB should be skipped, return a stub model directly
        if (shouldSkipDb()) return makeStubClient()[prop];
        // If a real client is already initialized, return the property
        if (globalForPrisma.prisma) return globalForPrisma.prisma[prop];
        // Try to build the real client lazily. If it fails, fall back to stub.
        // Note: we don't await here (get can't be async), so we return a
        // wrapper function that will await client readiness when called.
        return (...args)=>{
            // Ensure initialization proceeds and call the real method when ready.
            return (async ()=>{
                try {
                    const client = await buildRealPrisma();
                    const value = client[prop];
                    if (typeof value === 'function') return await value.apply(client, args);
                    return value;
                } catch (err) {
                    // Initialization failed (DB unreachable). Fall back to stub.
                    const stub = makeStubClient();
                    const v = stub[prop];
                    if (typeof v === 'function') return await v.apply(stub, args);
                    return v;
                }
            })();
        };
    }
});
// Helper wrappers to avoid calling deep methods on imported objects from
// server components directly. Export small functions instead to keep Next's
// server-component/runtime serialization happy.
// Use dynamic import of PrismaClient inside helper functions so Next's
// server-side bundler doesn't treat `prisma` model method invocations as
// cross-module calls. Each helper creates a short-lived client and
// disconnects afterwards. This is safe for dev and avoids invalid
// invocation errors during SSR.
//
// To avoid build-time failures when a database is not available (for
// example during Next's prerender/page-data collection), set
// SKIP_DB_ON_BUILD=true in the environment (or leave DATABASE_URL empty).
// When the flag is set, the helpers return safe defaults instead of
// attempting to connect to Postgres.
function shouldSkipDb() {
    return process.env.SKIP_DB_ON_BUILD === 'true' || !process.env.DATABASE_URL;
}
async function findRoomTypes(args) {
    if (shouldSkipDb()) return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        __turbopack_context__.A("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client, async loader)"),
        __turbopack_context__.A("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg, async loader)"),
        __turbopack_context__.A("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript, async loader)")
    ]);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'query',
            'error',
            'warn'
        ] : "TURBOPACK unreachable"
    });
    try {
        return await client.roomType.findMany(args);
    } finally{
        try {
            await client.$disconnect();
        } catch (e) {
        // ignore
        }
        try {
            await pool.end();
        } catch (e) {
        // ignore
        }
    }
}
async function findRoomTypesWithRooms(args) {
    if (shouldSkipDb()) return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        __turbopack_context__.A("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client, async loader)"),
        __turbopack_context__.A("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg, async loader)"),
        __turbopack_context__.A("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript, async loader)")
    ]);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'query',
            'error',
            'warn'
        ] : "TURBOPACK unreachable"
    });
    try {
        return await client.roomType.findMany(args);
    } finally{
        try {
            await client.$disconnect();
        } catch (e) {
        // ignore
        }
        try {
            await pool.end();
        } catch (e) {
        // ignore
        }
    }
}
async function findAllRoomTypes() {
    if (shouldSkipDb()) return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        __turbopack_context__.A("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client, async loader)"),
        __turbopack_context__.A("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg, async loader)"),
        __turbopack_context__.A("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript, async loader)")
    ]);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'query',
            'error',
            'warn'
        ] : "TURBOPACK unreachable"
    });
    try {
        return await client.roomType.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    } finally{
        try {
            await client.$disconnect();
        } catch (e) {
        // ignore
        }
        try {
            await pool.end();
        } catch (e) {
        // ignore
        }
    }
}
async function createRoomType(data) {
    if (shouldSkipDb()) return null;
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        __turbopack_context__.A("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client, async loader)"),
        __turbopack_context__.A("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg, async loader)"),
        __turbopack_context__.A("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript, async loader)")
    ]);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'query',
            'error',
            'warn'
        ] : "TURBOPACK unreachable"
    });
    try {
        return await client.roomType.create({
            data
        });
    } finally{
        try {
            await client.$disconnect();
        } catch (e) {
        // ignore
        }
        try {
            await pool.end();
        } catch (e) {
        // ignore
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Security utilities and constants
// Rate limiting configuration
__turbopack_context__.s([
    "FILE_UPLOAD",
    ()=>FILE_UPLOAD,
    "PASSWORD_REQUIREMENTS",
    ()=>PASSWORD_REQUIREMENTS,
    "RATE_LIMITS",
    ()=>RATE_LIMITS,
    "SESSION_CONFIG",
    ()=>SESSION_CONFIG,
    "generateSecureToken",
    ()=>generateSecureToken,
    "isIpAllowed",
    ()=>isIpAllowed,
    "isSuspiciousUserAgent",
    ()=>isSuspiciousUserAgent,
    "isValidEmail",
    ()=>isValidEmail,
    "isValidPhone",
    ()=>isValidPhone,
    "sanitizeHtml",
    ()=>sanitizeHtml,
    "sanitizeInput",
    ()=>sanitizeInput,
    "validateBookingDates",
    ()=>validateBookingDates,
    "validatePasswordStrength",
    ()=>validatePasswordStrength
]);
const RATE_LIMITS = {
    LOGIN_ATTEMPTS: {
        MAX_ATTEMPTS: 5,
        WINDOW_MS: 15 * 60 * 1000
    },
    API_REQUESTS: {
        MAX_REQUESTS: 100,
        WINDOW_MS: 60 * 1000
    },
    FILE_UPLOAD: {
        MAX_REQUESTS: 10,
        WINDOW_MS: 60 * 1000
    }
};
const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ],
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
};
const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: false
};
const SESSION_CONFIG = {
    MAX_AGE: 30 * 24 * 60 * 60,
    UPDATE_AGE: 24 * 60 * 60
};
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    // Remove potential XSS characters
    return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
        errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_REQUIREMENTS.MIN_LENGTH} ký tự`);
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ số');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function sanitizeHtml(html) {
    if (typeof html !== 'string') return '';
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}
function isSuspiciousUserAgent(userAgent) {
    if (!userAgent) return true;
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i
    ];
    return suspiciousPatterns.some((pattern)=>pattern.test(userAgent));
}
function generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomValues = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomValues);
        for(let i = 0; i < length; i++){
            token += chars[randomValues[i] % chars.length];
        }
    } else {
        // Fallback for Node.js
        for(let i = 0; i < length; i++){
            token += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return token;
}
function validateBookingDates(checkIn, checkOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
        return {
            valid: false,
            error: 'Check-in date cannot be in the past'
        };
    }
    if (checkOut <= checkIn) {
        return {
            valid: false,
            error: 'Check-out date must be after check-in date'
        };
    }
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (checkIn > maxDate) {
        return {
            valid: false,
            error: 'Check-in date cannot be more than 1 year in advance'
        };
    }
    const maxStay = 30; // days
    const stayDuration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    if (stayDuration > maxStay) {
        return {
            valid: false,
            error: `Maximum stay duration is ${maxStay} days`
        };
    }
    return {
        valid: true
    };
}
function isIpAllowed(ip) {
    // Add your IP whitelist/blacklist logic here
    const blacklist = [];
    // Example: blacklist.push('192.168.1.100');
    return !blacklist.includes(ip);
}
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
"[project]/apps/web/src/app/api/auth/register/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/security.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const registerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).max(100),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
});
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
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Dữ liệu không hợp lệ",
                errors: result.error.flatten().fieldErrors
            }, {
                status: 400
            });
        }
        const validatedData = result.data;
        // Check if user already exists
        const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: validatedData.email
            }
        });
        if (existingUser) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Email đã được sử dụng"
            }, {
                status: 400
            });
        }
        // Hash password
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(validatedData.password, 10);
        // Create user
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.create({
            data: {
                name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeInput"])(validatedData.name),
                email: validatedData.email.toLowerCase().trim(),
                phone: validatedData.phone ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeInput"])(validatedData.phone) : null,
                password: hashedPassword,
                role: "CUSTOMER"
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Đăng ký thành công",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, {
            status: 201
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Dữ liệu không hợp lệ",
                errors: error.issues
            }, {
                status: 400
            });
        }
        console.error("Registration error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Đã có lỗi xảy ra"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5af842e1._.js.map