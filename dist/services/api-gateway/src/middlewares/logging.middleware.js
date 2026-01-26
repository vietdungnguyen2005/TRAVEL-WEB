let loggingMiddleware;
try {
    // require at runtime so dev doesn't crash if it's not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const morgan = require('morgan');
    loggingMiddleware = morgan('combined');
}
catch (err) {
    // fallback no-op middleware when morgan isn't available
    loggingMiddleware = (_req, _res, next) => next();
}
export { loggingMiddleware };
//# sourceMappingURL=logging.middleware.js.map