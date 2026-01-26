let rateLimitMiddleware;
try {
    // require at runtime so dev doesn't crash if it's not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rateLimit = require('express-rate-limit');
    rateLimitMiddleware = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later.',
    });
}
catch (err) {
    // fallback no-op middleware when express-rate-limit isn't available
    rateLimitMiddleware = (_req, _res, next) => next();
}
export { rateLimitMiddleware };
//# sourceMappingURL=rateLimit.middleware.js.map