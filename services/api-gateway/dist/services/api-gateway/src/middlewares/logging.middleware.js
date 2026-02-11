"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = loggingMiddleware;
const shared_1 = require("@travel-web/shared");
const logger = new shared_1.Logger('api-gateway');
function loggingMiddleware(req, res, next) {
    const start = process.hrtime.bigint();
    const requestId = req.requestId;
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        logger.info('request', {
            requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: Math.round(durationMs),
            ip: req.ip,
            userAgent: req.header('user-agent'),
        });
    });
    next();
}
//# sourceMappingURL=logging.middleware.js.map