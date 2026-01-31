import express from 'express';
import { consulRegisterService, Logger } from '@travel-web/shared';
import { authRouter } from './http/routes';
import { errorHandler } from './http/middlewares/error-handler';
import cookieParser from 'cookie-parser';
import { config as dotenvConfig } from 'dotenv';

// Keep consistent with other services: load root env file in dev
dotenvConfig({ path: '../../.env' });

const logger = new Logger('AuthService');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'auth-service' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'authService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err as Error));
    }
});