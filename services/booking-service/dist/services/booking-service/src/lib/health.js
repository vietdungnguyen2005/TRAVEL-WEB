"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = healthHandler;
exports.readyHandler = readyHandler;
const amqplib_1 = __importDefault(require("amqplib"));
const prisma_1 = __importDefault(require("./prisma"));
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
function healthHandler(_req, res) {
    checkDb()
        .then(() => res.status(200).json({ status: 'ok' }))
        .catch((err) => res.status(503).json({ status: 'fail', dependency: 'db', error: err.message }));
}
function readyHandler(_req, res) {
    Promise.all([checkDb(), checkRabbitMq()])
        .then(() => res.status(200).json({ status: 'ready' }))
        .catch((err) => {
        const message = err.message;
        res.status(503).json({ status: 'not-ready', error: message });
    });
}
//# sourceMappingURL=health.js.map