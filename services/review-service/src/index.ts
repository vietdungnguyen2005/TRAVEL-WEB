import express from 'express';
import { consulRegisterService, createCorrelationIdMiddleware } from '@travel-web/shared';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(createCorrelationIdMiddleware());
app.get('/health', (req, res) => res.send('Review service healthy'));

app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
