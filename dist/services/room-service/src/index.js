import express from 'express';
import { consulRegisterService } from '@travel-web/shared';
const app = express();
const PORT = process.env.PORT || 3003;
app.get('/health', (req, res) => res.send('Room service healthy'));
app.listen(PORT, () => {
    console.log(`Room service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'roomService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map