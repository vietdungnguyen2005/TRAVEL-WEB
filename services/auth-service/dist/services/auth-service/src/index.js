"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const routes_1 = require("./http/routes");
const admin_1 = require("./http/routes/admin");
const error_handler_1 = require("./http/middlewares/error-handler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const load_env_profile_1 = require("../../../infra/scripts/load-env-profile");
const jwt_rs256_1 = require("./lib/jwt.rs256");
// Load root env + selected profile env (.env.docker/.env.supabase)
// Only do this when explicitly requested; in docker-compose we rely on container-provided env.
if (process.env.LOAD_ENV_PROFILE === 'true') {
    (0, load_env_profile_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
}
const logger = new shared_1.Logger('AuthService');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Standard discovery endpoint for public keys (used by API Gateway)
app.get('/.well-known/jwks.json', (_req, res) => {
    try {
        return res.status(200).json((0, jwt_rs256_1.getJwks)());
    }
    catch (err) {
        return res.status(500).json({ error: 'JWKS not available', message: err.message });
    }
});
app.use('/api/auth', routes_1.authRouter);
app.use('/api/admin', admin_1.adminRouter);
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'auth-service' });
});
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'authService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map