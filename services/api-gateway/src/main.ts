import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { corsMiddleware } from './middlewares/cors.middleware';
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { metricsMiddleware } from './middlewares/metrics.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import routes from './routes';
import { Logger } from '@travel-web/shared';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 4000;
const logger = new Logger('api-gateway');

// If running behind a reverse proxy (Nginx/Ingress/LB), trust X-Forwarded-* headers
// so req.ip and secure cookies behave correctly.
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

// Middlewares
app.use(helmet());
app.use(corsMiddleware);
app.use(requestIdMiddleware);
app.use(metricsMiddleware);
app.use(rateLimitMiddleware);
app.use(loggingMiddleware);

// Routes
app.use(routes);

// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    void _next;
    if (err instanceof Error) {
        logger.error('unhandled_error', err);
    } else {
        logger.error('unhandled_error_non_error', new Error(typeof err === 'string' ? err : 'Unknown error'));
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
