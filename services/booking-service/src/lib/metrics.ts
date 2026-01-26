import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const bookingCreateCounter = new client.Counter({
    name: 'booking_created_total',
    help: 'Total number of bookings created',
    labelNames: ['status']
});

register.registerMetric(bookingCreateCounter);

export default register;
