import express from 'express';
import { consulRegisterService, Logger } from '@travel-web/shared';
import { authRouter } from './http/routes';
import { adminRouter } from './http/routes/admin';
import { errorHandler } from './http/middlewares/error-handler';
import cookieParser from 'cookie-parser';
import { loadEnvProfile } from '../../../infra/scripts/load-env-profile';
import { getJwks } from './lib/jwt.rs256';

// Load root env + selected profile env (.env.docker/.env.supabase)
// Only do this when explicitly requested; in docker-compose we rely on container-provided env.
if (process.env.LOAD_ENV_PROFILE === 'true') {
    loadEnvProfile({ cwd: process.cwd().split('/services/')[0] });
}

const logger = new Logger('AuthService');
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(cookieParser());

// Standard discovery endpoint for public keys (used by API Gateway)
app.get('/.well-known/jwks.json', (_req, res) => {
    try {
        return res.status(200).json(getJwks());
    } catch (err) {
        return res.status(500).json({ error: 'JWKS not available', message: (err as Error).message });
    }
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

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