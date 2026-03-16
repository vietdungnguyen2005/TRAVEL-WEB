import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage, ServerResponse } from 'http';
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

            // Forward idempotency-key for payment operations
            const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
            if (idempotencyKey) {
                proxyReq.setHeader('idempotency-key', idempotencyKey as string);
            }
        },
        // Strip Set-Cookie from *non-OAuth* upstream responses.
        // The web app manages JWT cookies via JS (document.cookie).
        // If upstream httpOnly cookies leak through, they block the JS-set
        // cookies (RFC 6265) and break client-side auth checks.
        //
        // EXCEPTION: OAuth flows (e.g. /api/auth/oauth/google) rely on
        // httpOnly cookies (oauth_state, oauth_code_verifier) that MUST
        // survive the gateway proxy for the PKCE flow to work.
        onProxyRes: (proxyRes, req) => {
            const url = (req as unknown as { originalUrl?: string }).originalUrl || req.url || '';
            const isOAuthPath = url.startsWith('/api/auth/oauth');
            if (!isOAuthPath) {
                delete proxyRes.headers['set-cookie'];
            }
        },
        onError: (err: Error, _req: IncomingMessage, res: ServerResponse) => {
            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ success: false, error: `Service ${serviceKey} unavailable` }));
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
    notification: proxyTo('notificationService', '/api/test'),
};
