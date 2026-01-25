import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.config';

export const proxyMiddleware = {
    auth: createProxyMiddleware({
        target: services.authService,
        changeOrigin: true,
        pathRewrite: { '^/api/auth': '' },
    }),
    bookings: createProxyMiddleware({
        target: services.bookingService,
        changeOrigin: true,
        pathRewrite: { '^/api/bookings': '' },
    }),
    rooms: createProxyMiddleware({
        target: services.roomService,
        changeOrigin: true,
        pathRewrite: { '^/api/rooms': '' },
    }),
    payments: createProxyMiddleware({
        target: services.paymentService,
        changeOrigin: true,
        pathRewrite: { '^/api/payments': '' },
    }),
    reviews: createProxyMiddleware({
        target: services.reviewService,
        changeOrigin: true,
        pathRewrite: { '^/api/reviews': '' },
    }),
};
