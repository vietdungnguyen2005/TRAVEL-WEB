"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyMiddleware = void 0;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const service_resolver_1 = require("../discovery/service-resolver");
function proxyTo(serviceKey, pathPrefix) {
    return (0, http_proxy_middleware_1.createProxyMiddleware)({
        // Used by http-proxy-middleware for initial setup/logging; real routing happens via router().
        target: (0, service_resolver_1.getServicePlaceholderTarget)(serviceKey),
        changeOrigin: true,
        pathRewrite: { [`^${pathPrefix}`]: '' },
        router: async () => {
            return await (0, service_resolver_1.getServiceTarget)(serviceKey);
        },
        proxyTimeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15000),
        timeout: Number(process.env.UPSTREAM_TIMEOUT_MS || 15000),
    });
}
exports.proxyMiddleware = {
    auth: proxyTo('authService', '/api/auth'),
    bookings: proxyTo('bookingService', '/api/bookings'),
    rooms: proxyTo('roomService', '/api/rooms'),
    payments: proxyTo('paymentService', '/api/payments'),
    reviews: proxyTo('reviewService', '/api/reviews'),
};
//# sourceMappingURL=proxy.middleware.js.map