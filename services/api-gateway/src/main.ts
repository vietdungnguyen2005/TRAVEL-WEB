import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { corsMiddleware } from './middlewares/cors.middleware';
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import routes from './routes';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 4000;

// Middlewares
app.use(helmet());
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(loggingMiddleware);

// Routes
app.use(routes);

// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
