import express from 'express';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const shared = require('@travel-web/shared') as typeof import('@travel-web/shared');
import { authRouter } from './http/routes';
import { adminRouter } from './http/routes/admin';
import { userProfileRouter } from './http/routes/user-profile';
import cookieParser from 'cookie-parser';
import { getJwks } from './lib/jwt.rs256';

const {
    consulRegisterService,
    createCorrelationIdMiddleware,
    createErrorHandler,
    loadEnvProfile,
    Logger,
    validateEnv,
    AUTH_SERVICE_ENV_RULES,
} = shared as typeof import('@travel-web/shared');

// Load root env + selected profile env (.env.docker/.env.supabase)
// loadEnvProfile won't override vars already set by Docker/container env.
loadEnvProfile({ cwd: process.cwd().split(/[/\\]services[/\\]/)[0] || process.cwd() });

// Validate required env vars early — fail fast instead of cryptic runtime errors
validateEnv({ serviceName: 'auth-service', rules: AUTH_SERVICE_ENV_RULES });

const logger = new Logger('AuthService');
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(createCorrelationIdMiddleware());
app.use(cookieParser());

// Serve uploaded avatars as static files
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

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
app.use('/api/user', userProfileRouter);

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'auth-service' });
});

app.use(createErrorHandler('auth-service'));

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