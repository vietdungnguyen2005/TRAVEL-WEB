import express from 'express';
import metricsRegister from '../../lib/metrics';

export function createHealthRouter() {
    const router = express.Router();

    router.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'notification-service' }));

    router.get('/metrics', async (_req, res) => {
        res.setHeader('Content-Type', metricsRegister.contentType);
        res.end(await metricsRegister.metrics());
    });

    return router;
}
