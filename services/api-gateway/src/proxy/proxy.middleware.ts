import { createProxyMiddleware } from 'http-proxy-middleware';
import { getServiceTarget } from '../discovery/service-resolver';

type ServiceKey = 'authService' | 'bookingService' | 'roomService' | 'paymentService' | 'reviewService';

function proxyTo(serviceKey: ServiceKey, pathPrefix: string) {
    return createProxyMiddleware({
        target: 'http://localhost', // placeholder; will be overridden by router()
        changeOrigin: true,
        pathRewrite: { [`^${pathPrefix}`]: '' },
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
};
