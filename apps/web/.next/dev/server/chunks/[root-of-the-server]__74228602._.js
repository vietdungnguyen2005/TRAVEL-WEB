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
"[project]/apps/web/src/app/api/hero-images/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/prisma.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request) {
    try {
        const heroImages = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].heroImage.findMany({
            where: {
                active: true
            },
            orderBy: [
                {
                    order: "asc"
                },
                {
                    createdAt: "desc"
                }
            ]
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(heroImages);
    } catch (error) {
        console.error("Error fetching hero images:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch hero images"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__74228602._.js.map