"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const amqplib_1 = __importDefault(require("amqplib"));
const shared_1 = require("@travel-web/shared");
const booking_created_consumer_1 = require("./interfaces/events/booking-created.consumer");
const booking_cancelled_consumer_1 = require("./interfaces/events/booking-cancelled.consumer");
const metrics_1 = __importDefault(require("./lib/metrics"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const payments_routes_1 = require("./interfaces/http/payments.routes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
function getTimeoutMs() {
    const raw = process.env.HEALTHCHECK_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}
async function withTimeout(promise, timeoutMs, label) {
    let timeout = null;
    try {
        return await Promise.race([
            promise,
            new Promise((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
            }),
        ]);
    }
    finally {
        if (timeout)
            clearTimeout(timeout);
    }
}
async function checkDb() {
    const timeoutMs = getTimeoutMs();
    await withTimeout(prisma_1.default.$queryRaw `SELECT 1`, timeoutMs, 'DB check');
}
async function checkRabbitMq() {
    if (process.env.DISABLE_RABBITMQ === 'true')
        return;
    const url = process.env.RABBITMQ_URL;
    if (!url)
        throw new Error('RABBITMQ_URL is not set');
    const timeoutMs = getTimeoutMs();
    const conn = await withTimeout(amqplib_1.default.connect(url), timeoutMs, 'RabbitMQ connect');
    await withTimeout(conn.close(), timeoutMs, 'RabbitMQ close');
}
// Load root env + selected profile env (.env.docker/.env.supabase)
(0, shared_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
app.use((0, shared_1.createCorrelationIdMiddleware)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'payment-service' });
});
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.default.contentType);
    res.end(await metrics_1.default.metrics());
});
app.get('/healthz', async (_req, res) => {
    try {
        await checkDb();
        return res.status(200).json({ ok: true, service: 'payment-service' });
    }
    catch (err) {
        return res.status(503).json({ ok: false, service: 'payment-service', dependency: 'db', error: err.message });
    }
});
app.get('/ready', async (_req, res) => {
    try {
        await Promise.all([checkDb(), checkRabbitMq()]);
        return res.status(200).json({ status: 'ready' });
    }
    catch (err) {
        return res.status(503).json({ status: 'not-ready', error: err.message });
    }
});
app.use('/api/payments', (0, payments_routes_1.createPaymentsRouter)());
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
    (0, booking_created_consumer_1.startBookingEventsConsumer)().catch((err) => console.error('Booking events consumer failed to start', err));
    (0, booking_cancelled_consumer_1.startBookingCancelledConsumer)().catch((err) => console.error('Booking cancelled consumer failed to start', err));
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map