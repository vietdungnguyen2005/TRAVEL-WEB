"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const routes_1 = require("./http/routes");
const error_handler_1 = require("./http/middlewares/error-handler");
const outbox_publisher_1 = __importDefault(require("./lib/outbox-publisher"));
const payment_events_consumer_1 = require("./lib/payment-events-consumer");
const metrics_1 = __importDefault(require("./lib/metrics"));
const health_1 = require("./lib/health");
const logger = new shared_1.Logger('BookingService');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use(express_1.default.json());
app.use('/api/bookings', routes_1.bookingRouter);
app.get('/healthz', health_1.healthHandler);
app.get('/ready', health_1.readyHandler);
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.default.contentType);
    res.end(await metrics_1.default.metrics());
});
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`Booking Service running on port ${PORT}`);
    // start outbox publisher in background
    (0, outbox_publisher_1.default)().catch((err) => logger.error('Outbox publisher failed to start', err));
    // start consumer for payment.* events
    (0, payment_events_consumer_1.startPaymentEventsConsumer)().catch((err) => logger.error('Payment events consumer failed to start', err));
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'bookingService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map