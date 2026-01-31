import { createProxyMiddleware } from 'http-proxy-middleware';
import { getServicePlaceholderTarget, getServiceTarget } from '../discovery/service-resolver';
import { services as staticServices } from '../config/services.config';

type ServiceKey = keyof typeof staticServices;

function proxyTo(serviceKey: ServiceKey, pathPrefix: string) {
    return createProxyMiddleware({
        // Used by http-proxy-middleware for initial setup/logging; real routing happens via router().
        target: getServicePlaceholderTarget(serviceKey),
        changeOrigin: true,
        // Keep the prefix because upstream services mount their routers under the same prefix
        // e.g. auth-service mounts under `/api/auth`.
        pathRewrite: undefined,
        router: async () => {
            return await getServiceTarget(serviceKey);
        },
        proxyTimeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15_000),
        timeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15_000),
    });
}

export const proxyMiddleware = {
    auth: proxyTo('authService', '/api/auth'),
    bookings: proxyTo('bookingService', '/api/bookings'),
    rooms: proxyTo('roomService', '/api/rooms'),
    payments: proxyTo('paymentService', '/api/payments'),
    reviews: proxyTo('reviewService', '/api/reviews'),
    content: proxyTo('contentService', '/api/hero-images'),
    blog: proxyTo('blogService', '/api/blog'),
};
