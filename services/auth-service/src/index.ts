import express from 'express';
import { Logger } from '@travel-web/shared';
import { authRouter } from './http/routes';
import { errorHandler } from './http/middlewares/error-handler';

const logger = new Logger('AuthService');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
});