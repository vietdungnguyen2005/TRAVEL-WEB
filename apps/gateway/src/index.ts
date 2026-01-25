import express from 'express';
import { Logger } from '@travel-web/shared';
import { authMiddleware } from './middlewares/auth';
import { rateLimitMiddleware } from './middlewares/rate-limit';
import { errorHandler } from './middlewares/error-handler';

// Route handlers
import { bookingRoutes } from './routes/booking';
import { roomRoutes } from './routes/rooms';
import { authRoutes } from './routes/auth';
import { paymentRoutes } from './routes/payments';

const logger = new Logger('APIGateway');
const app = express();
const PORT = process.env.PORT || 4100;

// Middlewares
app.use(express.json());
app.use(rateLimitMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});