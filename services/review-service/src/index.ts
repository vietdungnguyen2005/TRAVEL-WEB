import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import { consulRegisterService, createCorrelationIdMiddleware, createErrorHandler, loadEnvProfile, Logger, validateEnv, REVIEW_SERVICE_ENV_RULES } from '@travel-web/shared';

// Load service-local .env first (has DATABASE_URL, JWT_SECRET, etc.)
dotenvConfig({ path: require('path').resolve(__dirname, '../.env') });
// Then load root .env for any remaining variables (won't override existing ones)
loadEnvProfile({ cwd: process.cwd().split(/[/\\]services[/\\]/)[0] || process.cwd() });
validateEnv({ serviceName: 'review-service', rules: REVIEW_SERVICE_ENV_RULES });

import { reviewRouter } from './interfaces/http/review.routes';
import metricsRegister from './lib/metrics';
import { healthHandler, readyHandler } from './lib/health';

const logger = new Logger('ReviewService');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(createCorrelationIdMiddleware());
app.use(express.json());
app.use('/api/reviews', reviewRouter);
app.get('/healthz', healthHandler);
app.get('/ready', readyHandler);
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
});
app.use(createErrorHandler('review-service'));

app.listen(PORT, () => {
    logger.info(`Review Service running on port ${PORT}`);

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => logger.error('Consul register failed', err as Error));
    }
});
