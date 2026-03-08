import { Router } from 'express';
import { createClient } from 'redis';
import { proxyMiddleware } from '../proxy/proxy.middleware';
import { requireAuthForPaths, requireAdminForPaths } from '../middlewares/auth.middleware';
import { discoveryConfig } from '../config/discovery.config';
import { getServiceTarget } from '../discovery/service-resolver';
import { register as metricsRegister } from '../lib/metrics';

const router = Router();

// VNPay IPN callback – no auth required (server-to-server from VNPay)
router.use('/api/payments/vnpay-ipn', proxyMiddleware.payments);

// JWT protection (verify at gateway, forward user context via x-user-* headers)
router.use(
    requireAuthForPaths([
        '/api/bookings',
        '/api/payments',
        '/api/admin',
    ], [
        '/api/bookings/unavailable-dates',
    ])
);

// Admin role guard – runs AFTER auth so req.auth is already set
router.use(
    requireAdminForPaths([
        '/api/admin',
    ])
);

// Proxy routes
router.use('/api/auth', proxyMiddleware.auth);
router.use('/api/bookings', proxyMiddleware.bookings);
router.use('/api/rooms', proxyMiddleware.rooms);
router.use('/api/payments', proxyMiddleware.payments);
router.use('/api/reviews', proxyMiddleware.reviews);
router.use('/api/hero-images', proxyMiddleware.content);
router.use('/api/blog', proxyMiddleware.blog);

// Admin (gateway-first): keep admin endpoints under /api/admin/* and forward to the owning service.
// - users, analytics -> auth service
// - rooms, room-types, hero-images -> room/content services
// - bookings -> booking service
router.use('/api/admin/users', proxyMiddleware.auth);
router.use('/api/admin/stats', proxyMiddleware.auth);
router.use('/api/admin/analytics', proxyMiddleware.auth);
router.use('/api/admin/bookings', proxyMiddleware.bookingsAdmin);
router.use('/api/admin/rooms', proxyMiddleware.rooms);
router.use('/api/admin/room-types', proxyMiddleware.rooms);
router.use('/api/admin/hero-images', proxyMiddleware.content);
router.use('/api/admin/blog', proxyMiddleware.blog);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'API Gateway is healthy' });
});

router.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
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

    const client = createClient({ url: redisUrl });
    try {
        await client.connect();
        const pong = await client.ping();
        await client.quit();
        return res.status(200).json({ status: 'ready', redis: pong });
    } catch (err) {
        try {
            await client.quit();
        } catch {
            // ignore
        }
        return res.status(503).json({ status: 'not-ready', dependency: 'redis', error: (err as Error).message });
    }
});

// Discovery debug endpoint
router.get('/discovery', async (_req, res) => {
    const targets = {
        authService: await getServiceTarget('authService'),
        bookingService: await getServiceTarget('bookingService'),
        roomService: await getServiceTarget('roomService'),
        paymentService: await getServiceTarget('paymentService'),
        reviewService: await getServiceTarget('reviewService'),
    };
    res.status(200).json({
        success: true,
        mode: discoveryConfig.mode,
        consulUrl: discoveryConfig.consulUrl,
        refreshMs: discoveryConfig.refreshMs,
        targets,
    });
});

export default router;
