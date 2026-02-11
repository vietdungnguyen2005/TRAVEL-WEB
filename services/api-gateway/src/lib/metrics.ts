import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
    name: 'gateway_http_requests_total',
    help: 'Total HTTP requests handled by the API gateway',
    labelNames: ['method', 'route', 'status'],
});

export const httpRequestDurationSeconds = new client.Histogram({
    name: 'gateway_http_request_duration_seconds',
    help: 'HTTP request duration in seconds (API gateway)',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
