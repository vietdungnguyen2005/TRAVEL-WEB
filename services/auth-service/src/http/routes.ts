import { Router } from 'express';
import { register, login, verifyToken } from '../modules/auth/auth.controller';
import { googleCallback, googleStart } from '../modules/oauth/google/google.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verify', verifyToken);

// OAuth (Google)
authRouter.get('/oauth/google', googleStart);
authRouter.get('/oauth/google/callback', googleCallback);