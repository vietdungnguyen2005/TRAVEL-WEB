"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyMiddleware = void 0;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const service_resolver_1 = require("../discovery/service-resolver");
function proxyTo(serviceKey, _pathPrefix, opts) {
    return (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: (0, service_resolver_1.getServicePlaceholderTarget)(serviceKey),
        changeOrigin: true,
        pathRewrite: opts?.pathRewrite,
        router: async () => {
            return await (0, service_resolver_1.getServiceTarget)(serviceKey);
        },
        proxyTimeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15000),
        timeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15000),
        onProxyReq: (proxyReq, req) => {
            const requestId = req.requestId;
            if (requestId) {
                proxyReq.setHeader('x-request-id', requestId);
            }
            const auth = req.auth;
            if (auth?.userId)
                proxyReq.setHeader('x-user-id', auth.userId);
            if (auth?.role)
                proxyReq.setHeader('x-user-role', auth.role);
            // Forward idempotency-key for payment operations
            const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
            if (idempotencyKey) {
                proxyReq.setHeader('idempotency-key', idempotencyKey);
            }
        },
        // Strip Set-Cookie from upstream responses.
        // The web app manages its own cookies via JS (document.cookie).
        // If upstream httpOnly cookies leak through, they block the JS-set
        // cookies (RFC 6265) and break client-side auth checks.
        onProxyRes: (proxyRes) => {
            delete proxyRes.headers['set-cookie'];
        },
        onError: (err, _req, res) => {
            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ success: false, error: `Service ${serviceKey} unavailable` }));
        },
    });
}
exports.proxyMiddleware = {
    auth: proxyTo('authService', '/api/auth'),
    bookings: proxyTo('bookingService', '/api/bookings'),
    /** Admin bookings: booking service expects /api/bookings/admin/bookings */
    bookingsAdmin: proxyTo('bookingService', '/api/bookings', {
        pathRewrite: { '^/api/admin': '/api/bookings/admin' },
    }),
    rooms: proxyTo('roomService', '/api/rooms'),
    payments: proxyTo('paymentService', '/api/payments'),
    reviews: proxyTo('reviewService', '/api/reviews'),
    content: proxyTo('contentService', '/api/hero-images'),
    blog: proxyTo('blogService', '/api/blog'),
};
//# sourceMappingURL=proxy.middleware.js.map