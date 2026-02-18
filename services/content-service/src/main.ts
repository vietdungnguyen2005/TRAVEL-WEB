import express from 'express';
import cors from 'cors';
import { createCorrelationIdMiddleware } from '@travel-web/shared';
import { healthHandler, readyHandler } from './lib/health';
import { heroImagesRouter } from './http/routes';
import { adminHeroImagesRouter } from './http/routes/admin-hero-images';
import { errorHandler } from './http/middlewares/error-handler';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(createCorrelationIdMiddleware());
app.use(express.json());
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.get('/healthz', healthHandler);
app.get('/ready', readyHandler);

app.use('/api', heroImagesRouter);
app.use('/api/admin', adminHeroImagesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Content Service running on port ${PORT}`);
});
