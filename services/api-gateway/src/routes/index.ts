import { Router } from 'express';
import { createClient } from 'redis';
import { proxyMiddleware } from '../proxy/proxy.middleware';
import { requireAuthForPaths, requireAdminForPaths } from '../middlewares/auth.middleware';
import {
    loginRateLimiter,
    registerRateLimiter,
    forgotPasswordRateLimiter,
    refreshTokenRateLimiter,
    oauthRateLimiter,
} from '../middlewares/authRateLimit.middleware';
import { discoveryConfig } from '../config/discovery.config';
import { getServiceTarget } from '../discovery/service-resolver';
import { register as metricsRegister } from '../lib/metrics';

const router = Router();

// ══════════════════════════════════════════════════════════════════════
// API Versioning
// ──────────────────────────────────────────────────────────────────────
// Current version: v1
//
// Unversioned /api/* requests are rewritten to /api/v1/* for
// backward compatibility.  When v2 is introduced, only the
// versioned router below needs a companion; old callers keep
// working until deprecation.
// ══════════════════════════════════════════════════════════════════════

/**
 * Build the v1 API router.
 *
 * All business routes live here.  The outer `router` mounts this
 * under both `/api/v1` (canonical) and `/api` (compat alias).
 */
function createV1Router(): Router {
    const v1 = Router();

    // ── Auth-specific rate limiters (stricter than global) ──
    v1.post('/auth/login', loginRateLimiter);
    v1.post('/auth/register', registerRateLimiter);
    v1.post('/auth/forgot-password', forgotPasswordRateLimiter);
    v1.post('/auth/reset-password', forgotPasswordRateLimiter);
    v1.post('/auth/refresh', refreshTokenRateLimiter);
    v1.get('/auth/oauth/*', oauthRateLimiter);

    // VNPay callbacks are excluded from auth via publicExceptions below

    // JWT protection (verify at gateway, forward user context via x-user-* headers)
    v1.use(
        requireAuthForPaths([
            '/bookings',
            '/payments',
            '/admin',
            '/user',
            '/test',
        ], [
            '/bookings/unavailable-dates',
            '/payments/vnpay-ipn',
            '/payments/vnpay-return',
        ])
    );

    // Admin role guard – runs AFTER auth so req.auth is already set
    v1.use(
        requireAdminForPaths([
            '/admin',
            '/test',
        ])
    );

    // ── Proxy routes ──
    v1.use('/auth', proxyMiddleware.auth);
    v1.use('/user', proxyMiddleware.auth);
    v1.use('/bookings', proxyMiddleware.bookings);
    v1.use('/rooms', proxyMiddleware.rooms);
    v1.use('/payments', proxyMiddleware.payments);
    v1.use('/reviews', proxyMiddleware.reviews);
    v1.use('/hero-images', proxyMiddleware.content);
    v1.use('/blog', proxyMiddleware.blog);

    // Admin proxy routes
    v1.use('/admin/users', proxyMiddleware.auth);
    v1.use('/admin/stats', proxyMiddleware.auth);
    v1.use('/admin/analytics', proxyMiddleware.auth);
    v1.use('/admin/bookings', proxyMiddleware.bookingsAdmin);
    v1.use('/admin/rooms', proxyMiddleware.rooms);
    v1.use('/admin/room-types', proxyMiddleware.rooms);
    v1.use('/admin/hero-images', proxyMiddleware.content);
    v1.use('/admin/blog', proxyMiddleware.blog);
    v1.use('/test', proxyMiddleware.notification);

    return v1;
}

// ── Mount the v1 router ──

// Canonical versioned path: /api/v1/*
router.use('/api/v1', createV1Router());

// Backward-compatible alias: /api/* → same v1 logic
// Existing frontend & integrations keep working without changes.
router.use('/api', createV1Router());

// Static uploads (avatar images served by auth service) — not versioned
router.use('/uploads', proxyMiddleware.auth);

// ── Infrastructure endpoints (not versioned) ──

router.get('/health', (_req, res) => {
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

// API info / version discovery endpoint
router.get('/api', (_req, res) => {
    res.status(200).json({
        service: 'travel-web-api',
        versions: ['v1'],
        currentVersion: 'v1',
        documentation: '/api/v1',
    });
});

export default router;
