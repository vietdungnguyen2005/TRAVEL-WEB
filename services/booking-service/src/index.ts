import express from 'express';
import { consulRegisterService, Logger } from '@travel-web/shared';
import { bookingRouter } from './http/routes';
import { errorHandler } from './http/middlewares/error-handler';
import publishOutbox from './lib/outbox-publisher';
import { startPaymentEventsConsumer } from './lib/payment-events-consumer';
import metricsRegister, { bookingCreateCounter } from './lib/metrics';
import { healthHandler, readyHandler } from './lib/health';

const logger = new Logger('BookingService');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/api/bookings', bookingRouter);
app.get('/healthz', healthHandler);
app.get('/ready', readyHandler);
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', metricsRegister.contentType);
  res.end(await metricsRegister.metrics());
});
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Booking Service running on port ${PORT}`);
  // start outbox publisher in background
  publishOutbox().catch((err) => logger.error('Outbox publisher failed to start', err as Error));
  // start consumer for payment.* events
  startPaymentEventsConsumer().catch((err) => logger.error('Payment events consumer failed to start', err as Error));

  if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
    consulRegisterService({
      serviceName: 'bookingService',
      port: Number(PORT),
      healthCheckPath: '/healthz',
    }).catch((err) => logger.error('Consul register failed', err as Error));
  }
});