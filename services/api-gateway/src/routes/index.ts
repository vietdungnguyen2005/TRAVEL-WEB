import { Router } from 'express';
import { proxyMiddleware } from '../proxy/proxy.middleware';
import { discoveryConfig } from '../config/discovery.config';
import { getServiceTarget } from '../discovery/service-resolver';

const router = Router();

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
router.use('/api/admin/bookings', proxyMiddleware.bookings);
router.use('/api/admin/rooms', proxyMiddleware.rooms);
router.use('/api/admin/room-types', proxyMiddleware.rooms);
router.use('/api/admin/hero-images', proxyMiddleware.content);
router.use('/api/admin/blog', proxyMiddleware.blog);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'API Gateway is healthy' });
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
