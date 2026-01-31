"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proxy_middleware_1 = require("../proxy/proxy.middleware");
const discovery_config_1 = require("../config/discovery.config");
const service_resolver_1 = require("../discovery/service-resolver");
const router = (0, express_1.Router)();
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
router.use('/api/admin/bookings', proxy_middleware_1.proxyMiddleware.bookings);
router.use('/api/admin/rooms', proxy_middleware_1.proxyMiddleware.rooms);
router.use('/api/admin/room-types', proxy_middleware_1.proxyMiddleware.rooms);
router.use('/api/admin/hero-images', proxy_middleware_1.proxyMiddleware.content);
router.use('/api/admin/blog', proxy_middleware_1.proxyMiddleware.blog);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'API Gateway is healthy' });
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