import express from 'express';
import amqp from 'amqplib';
import { consulRegisterService, createCorrelationIdMiddleware, loadEnvProfile } from '@travel-web/shared';
import { startBookingEventsConsumer } from './interfaces/events/booking-created.consumer';
import { startBookingCancelledConsumer } from './interfaces/events/booking-cancelled.consumer';
import metricsRegister from './lib/metrics';
import prisma from './lib/prisma';
import { createPaymentsRouter } from './interfaces/http/payments.routes';

const app = express();
const PORT = process.env.PORT || 3004;

function getTimeoutMs() {
    const raw = process.env.HEALTHCHECK_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let timeout: NodeJS.Timeout | null = null;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
            }),
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

async function checkDb() {
    const timeoutMs = getTimeoutMs();
    await withTimeout(prisma.$queryRaw`SELECT 1`, timeoutMs, 'DB check');
}

async function checkRabbitMq() {
    if (process.env.DISABLE_RABBITMQ === 'true') return;

    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL is not set');

    const timeoutMs = getTimeoutMs();
    const conn = await withTimeout(amqp.connect(url), timeoutMs, 'RabbitMQ connect');
    await withTimeout(conn.close(), timeoutMs, 'RabbitMQ close');
}

// Load root env + selected profile env (.env.docker/.env.supabase)
loadEnvProfile({ cwd: process.cwd().split('/services/')[0] });

app.use(createCorrelationIdMiddleware());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'payment-service' });
});

app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
});

app.get('/healthz', async (_req, res) => {
    try {
        await checkDb();
        return res.status(200).json({ ok: true, service: 'payment-service' });
    } catch (err) {
        return res.status(503).json({ ok: false, service: 'payment-service', dependency: 'db', error: (err as Error).message });
    }
});

app.get('/ready', async (_req, res) => {
    try {
        await Promise.all([checkDb(), checkRabbitMq()]);
        return res.status(200).json({ status: 'ready' });
    } catch (err) {
        return res.status(503).json({ status: 'not-ready', error: (err as Error).message });
    }
});

app.use('/api/payments', createPaymentsRouter());

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);

    startBookingEventsConsumer().catch((err) => console.error('Booking events consumer failed to start', err));
    startBookingCancelledConsumer().catch((err) => console.error('Booking cancelled consumer failed to start', err));

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
