import { Router } from 'express';
import { register, login, verifyToken, refresh, logoutAll } from '../modules/auth/auth.controller';
import { googleCallback, googleStart } from '../modules/oauth/google/google.controller';
import { forgotPassword } from './routes/forgot-password';
import { resetPasswordHandler } from './routes/reset-password-express';
import { verifyResetTokenHandler } from './routes/verify-reset-token-express';
import { verifyEmailHandler } from './routes/verify-email-express';
import { resendVerificationEmailHandler } from './routes/resend-verification';
import { logout } from './routes/logout';
import { requireAuth, requireRole } from './middlewares/auth';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verify', verifyToken);
authRouter.post('/refresh', refresh);

// Password reset (Express handlers)
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPasswordHandler);
authRouter.get('/verify-reset-token', verifyResetTokenHandler);

// Email verification
authRouter.post('/verify-email', verifyEmailHandler);
authRouter.post('/resend-verification', resendVerificationEmailHandler);

// Logout
authRouter.post('/logout', logout);
authRouter.post('/logout-all', requireAuth, logoutAll);

// OAuth (Google)
authRouter.get('/oauth/google', googleStart);
authRouter.get('/oauth/google/callback', googleCallback);

// Example of protected route (admin only)
authRouter.get('/admin-only', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ ok: true }));