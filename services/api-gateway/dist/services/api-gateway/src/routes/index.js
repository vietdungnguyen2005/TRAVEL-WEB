"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("redis");
const proxy_middleware_1 = require("../proxy/proxy.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const discovery_config_1 = require("../config/discovery.config");
const service_resolver_1 = require("../discovery/service-resolver");
const metrics_1 = require("../lib/metrics");
const router = (0, express_1.Router)();
// VNPay IPN callback – no auth required (server-to-server from VNPay)
router.use('/api/payments/vnpay-ipn', proxy_middleware_1.proxyMiddleware.payments);
// JWT protection (verify at gateway, forward user context via x-user-* headers)
router.use((0, auth_middleware_1.requireAuthForPaths)([
    '/api/bookings',
    '/api/payments',
    '/api/admin',
], [
    '/api/bookings/unavailable-dates',
]));
// Admin role guard – runs AFTER auth so req.auth is already set
router.use((0, auth_middleware_1.requireAdminForPaths)([
    '/api/admin',
]));
// Proxy routes
router.use('/api/auth', proxy_middleware_1.proxyMiddleware.auth);
router.use('/api/bookings', proxy_middleware_1.proxyMiddleware.bookings);
router.use('/api/rooms', proxy_middleware_1.proxyMiddleware.rooms);
router.use('/api/payments', proxy_middleware_1.proxyMiddleware.payments);
router.use('/api/reviews', proxy_middleware_1.proxyMiddleware.reviews);
router.use('/api/hero-images', proxy_middleware_1.proxyMiddleware.content);
router.use('/api/blog', proxy_middleware_1.proxyMiddleware.blog);
// Admin (gateway-first): keep admin endpoints under /api/admin/* and forward to the owning service.
// - users, analytics -> auth service
// - rooms, room-types, hero-images -> room/content services
// - bookings -> booking service
router.use('/api/admin/users', proxy_middleware_1.proxyMiddleware.auth);
router.use('/api/admin/stats', proxy_middleware_1.proxyMiddleware.auth);
router.use('/api/admin/analytics', proxy_middleware_1.proxyMiddleware.auth);
router.use('/api/admin/bookings', proxy_middleware_1.proxyMiddleware.bookingsAdmin);
router.use('/api/admin/rooms', proxy_middleware_1.proxyMiddleware.rooms);
router.use('/api/admin/room-types', proxy_middleware_1.proxyMiddleware.rooms);
router.use('/api/admin/hero-images', proxy_middleware_1.proxyMiddleware.content);
router.use('/api/admin/blog', proxy_middleware_1.proxyMiddleware.blog);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'API Gateway is healthy' });
});
router.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.register.contentType);
    res.end(await metrics_1.register.metrics());
});
router.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, service: 'api-gateway' });
});
router.get('/ready', async (_req, res) => {
    // Gateway depends on Redis for production rate limiting.
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        return res.status(200).json({ status: 'ready' });
    }
    const client = (0, redis_1.createClient)({ url: redisUrl });
    try {
        await client.connect();
        const pong = await client.ping();
        await client.quit();
        return res.status(200).json({ status: 'ready', redis: pong });
    }
    catch (err) {
        try {
            await client.quit();
        }
        catch {
            // ignore
        }
        return res.status(503).json({ status: 'not-ready', dependency: 'redis', error: err.message });
    }
});
// Discovery debug endpoint
router.get('/discovery', async (_req, res) => {
    const targets = {
        authService: await (0, service_resolver_1.getServiceTarget)('authService'),
        bookingService: await (0, service_resolver_1.getServiceTarget)('bookingService'),
        roomService: await (0, service_resolver_1.getServiceTarget)('roomService'),
        paymentService: await (0, service_resolver_1.getServiceTarget)('paymentService'),
        reviewService: await (0, service_resolver_1.getServiceTarget)('reviewService'),
    };
    res.status(200).json({
        success: true,
        mode: discovery_config_1.discoveryConfig.mode,
        consulUrl: discovery_config_1.discoveryConfig.consulUrl,
        refreshMs: discovery_config_1.discoveryConfig.refreshMs,
        targets,
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map