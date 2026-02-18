import express from 'express';
import { consulRegisterService, createCorrelationIdMiddleware, Logger, loadEnvProfile } from '@travel-web/shared';

import { startEmailWorker } from './lib/email-worker';
import { startNotificationConsumers } from './interfaces/events/notification-consumers';
import { createHealthRouter } from './interfaces/http/health.routes';

const app = express();
const PORT = process.env.PORT || 3006;
const logger = new Logger('NotificationService');

// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
loadEnvProfile({ cwd: process.cwd().split('/services/')[0] });

app.use(createCorrelationIdMiddleware());
app.use(createHealthRouter());

app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
    startNotificationConsumers().catch((err) => logger.error('Failed to start consumers', err as Error));

    // Background worker to send emails and transition notifications: PENDING -> SENT/FAILED (with retries).
    startEmailWorker().catch((err) => logger.error('Email worker failed to start', err as Error));

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err as Error));
    }
});
