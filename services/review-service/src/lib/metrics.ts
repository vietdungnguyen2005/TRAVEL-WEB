import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const reviewCreateCounter = new client.Counter({
    name: 'review_created_total',
    help: 'Total number of reviews created',
});

export const reviewDeleteCounter = new client.Counter({
    name: 'review_deleted_total',
    help: 'Total number of reviews deleted',
});

export const reviewVerifyCounter = new client.Counter({
    name: 'review_verified_total',
    help: 'Total number of reviews verified by admin',
});

register.registerMetric(reviewCreateCounter);
register.registerMetric(reviewDeleteCounter);
register.registerMetric(reviewVerifyCounter);

export default register;
