module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

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
"[project]/apps/web/src/app/api/admin/blog/posts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gateway.ts [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
async function proxyJson(req, path) {
    const contentType = req.headers.get("content-type") ?? "application/json";
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();
    const accessToken = req.cookies.get("access_token")?.value;
    const authHeader = req.headers.get("authorization") ?? undefined;
    const authorization = authHeader || (accessToken ? `Bearer ${accessToken}` : undefined);
    const upstream = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gatewayFetch"])(req, path, {
        method: req.method,
        headers: {
            "content-type": contentType,
            accept: "application/json",
            ...authorization ? {
                authorization
            } : {}
        },
        body
    });
    const text = await upstream.text();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](text, {
        status: upstream.status,
        headers: {
            "content-type": upstream.headers.get("content-type") ?? "application/json",
            "cache-control": "no-store"
        }
    });
}
async function GET(req) {
    return proxyJson(req, "/api/admin/blog/posts");
}
async function POST(req) {
    return proxyJson(req, "/api/admin/blog/posts");
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d818e3a2._.js.map