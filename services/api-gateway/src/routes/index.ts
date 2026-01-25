import { Router } from 'express';
import { proxyMiddleware } from '../proxy/proxy.middleware';

const router = Router();

// Proxy routes
router.use('/api/auth', proxyMiddleware.auth);
router.use('/api/bookings', proxyMiddleware.bookings);
router.use('/api/rooms', proxyMiddleware.rooms);
router.use('/api/payments', proxyMiddleware.payments);
router.use('/api/reviews', proxyMiddleware.reviews);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'API Gateway is healthy' });
});

export default router;
