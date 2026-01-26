"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = void 0;
let loggingMiddleware;
try {
    // require at runtime so dev doesn't crash if it's not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const morgan = require('morgan');
    exports.loggingMiddleware = loggingMiddleware = morgan('combined');
}
catch (err) {
    // fallback no-op middleware when morgan isn't available
    exports.loggingMiddleware = loggingMiddleware = (_req, _res, next) => next();
}
//# sourceMappingURL=logging.middleware.js.map