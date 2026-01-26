import express from 'express';
import cors from 'cors';
import { consulRegisterService } from '@travel-web/shared';
import reviewRoutes from './modules/review/review.routes';
const app = express();
const PORT = process.env.PORT || 3005;
app.use(cors());
app.use(express.json());
app.use('/reviews', reviewRoutes);
app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/reviews/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map