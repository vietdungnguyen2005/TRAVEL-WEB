import { Router } from 'express';
import { register, login, verifyToken } from '../modules/auth/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verify', verifyToken);