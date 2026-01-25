import express from 'express';
import { Logger } from '@travel-web/shared';
import { bookingRouter } from './http/routes';
import { errorHandler } from './http/middlewares/error-handler';

const logger = new Logger('BookingService');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/api/bookings', bookingRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Booking Service running on port ${PORT}`);
});