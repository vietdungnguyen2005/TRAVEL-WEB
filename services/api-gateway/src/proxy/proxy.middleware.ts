import { createProxyMiddleware } from 'http-proxy-middleware';
import { getServicePlaceholderTarget, getServiceTarget } from '../discovery/service-resolver';
import { services as staticServices } from '../config/services.config';
import type { RequestWithId } from '../middlewares/requestId.middleware';
import type { RequestWithAuth } from '../middlewares/auth.middleware';

type ServiceKey = keyof typeof staticServices;

type ProxyOptions = {
    pathRewrite?: Record<string, string>;
};

function proxyTo(serviceKey: ServiceKey, _pathPrefix: string, opts?: ProxyOptions) {
    return createProxyMiddleware({
        target: getServicePlaceholderTarget(serviceKey),
        changeOrigin: true,
        pathRewrite: opts?.pathRewrite,
        router: async () => {
            return await getServiceTarget(serviceKey);
        },
        proxyTimeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15_000),
        timeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15_000),
        onProxyReq: (proxyReq, req) => {
            const requestId = (req as RequestWithId).requestId;
            if (requestId) {
                proxyReq.setHeader('x-request-id', requestId);
            }

            const auth = (req as RequestWithAuth).auth;
            if (auth?.userId) proxyReq.setHeader('x-user-id', auth.userId);
            if (auth?.role) proxyReq.setHeader('x-user-role', auth.role);
        },
    });
}

export const proxyMiddleware = {
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
