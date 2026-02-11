"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = metricsMiddleware;
const metrics_1 = require("../lib/metrics");
function normalizeRoute(pathname) {
    const path = pathname.split('?')[0] || '/';
    if (path === '/metrics')
        return '/metrics';
    if (path === '/health' || path === '/healthz')
        return '/health';
    if (path === '/ready')
        return '/ready';
    if (path === '/discovery')
        return '/discovery';
    // Admin
    if (path.startsWith('/api/admin/'))
        return '/api/admin/*';
    // Public APIs
    const apiPrefixes = [
        '/api/auth',
        '/api/bookings',
        '/api/rooms',
        '/api/payments',
        '/api/reviews',
        '/api/hero-images',
        '/api/blog',
    ];
    for (const p of apiPrefixes) {
        if (path === p || path.startsWith(`${p}/`))
            return p;
    }
    return 'other';
}
function metricsMiddleware(req, res, next) {
    if (req.path === '/metrics')
        return next();
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const method = (req.method || 'GET').toUpperCase();
        const route = normalizeRoute(req.originalUrl || req.url || req.path);
        const status = String(res.statusCode || 0);
        metrics_1.httpRequestsTotal.labels(method, route, status).inc(1);
        metrics_1.httpRequestDurationSeconds.labels(method, route, status).observe(durationSeconds);
    });
    next();
}
//# sourceMappingURL=metrics.middleware.js.map