"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@travel-web/shared");
(0, shared_1.loadEnvProfile)({ cwd: process.cwd().split(/[/\\]services[/\\]/)[0] || process.cwd() });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const review_routes_1 = require("./interfaces/http/review.routes");
const error_handler_1 = require("./http/middlewares/error-handler");
const metrics_1 = __importDefault(require("./lib/metrics"));
const health_1 = require("./lib/health");
const logger = new shared_1.Logger('ReviewService');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
app.use((0, shared_1.createCorrelationIdMiddleware)());
app.use(express_1.default.json());
app.use('/api/reviews', review_routes_1.reviewRouter);
app.get('/healthz', health_1.healthHandler);
app.get('/ready', health_1.readyHandler);
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.default.contentType);
    res.end(await metrics_1.default.metrics());
});
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`Review Service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map