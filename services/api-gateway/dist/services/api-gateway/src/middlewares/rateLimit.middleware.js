"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = void 0;
let rateLimitMiddleware;
try {
    // require at runtime so dev doesn't crash if it's not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rateLimit = require('express-rate-limit');
    exports.rateLimitMiddleware = rateLimitMiddleware = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later.',
    });
}
catch (err) {
    // fallback no-op middleware when express-rate-limit isn't available
    exports.rateLimitMiddleware = rateLimitMiddleware = (_req, _res, next) => next();
}
//# sourceMappingURL=rateLimit.middleware.js.map