"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = require("dotenv");
const cors_middleware_1 = require("./middlewares/cors.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const logging_middleware_1 = require("./middlewares/logging.middleware");
const metrics_middleware_1 = require("./middlewares/metrics.middleware");
const requestId_middleware_1 = require("./middlewares/requestId.middleware");
const routes_1 = __importDefault(require("./routes"));
const shared_1 = require("@travel-web/shared");
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 4000;
const logger = new shared_1.Logger('api-gateway');
// If running behind a reverse proxy (Nginx/Ingress/LB), trust X-Forwarded-* headers
// so req.ip and secure cookies behave correctly.
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}
// Middlewares
app.use((0, helmet_1.default)());
app.use(cors_middleware_1.corsMiddleware);
app.use(requestId_middleware_1.requestIdMiddleware);
app.use(metrics_middleware_1.metricsMiddleware);
app.use(rateLimit_middleware_1.rateLimitMiddleware);
app.use(logging_middleware_1.loggingMiddleware);
// Routes
app.use(routes_1.default);
// Global error handler
app.use((err, _req, res, _next) => {
    if (err instanceof Error) {
        logger.error('unhandled_error', err);
    }
    else {
        logger.error('unhandled_error_non_error', new Error(typeof err === 'string' ? err : 'Unknown error'));
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});
// Start server
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map