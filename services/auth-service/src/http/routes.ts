import { Router } from 'express';
import { register, login, refresh, logoutAll } from '../interfaces/http/controllers/auth.controller';
import { verifyToken } from '../interfaces/http/controllers/verify.controller';
import { googleCallback, googleStart } from '../modules/oauth/google/google.controller';
import { forgotPassword } from './routes/forgot-password';
import { resetPasswordHandler } from './routes/reset-password-express';
import { verifyResetTokenHandler } from './routes/verify-reset-token-express';
import { verifyEmail, resendVerificationEmail } from '../interfaces/http/controllers/email-verification.controller';
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
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerificationEmail);

// Logout
authRouter.post('/logout', logout);
authRouter.post('/logout-all', requireAuth, logoutAll);

// OAuth (Google)
authRouter.get('/oauth/google', googleStart);
authRouter.get('/oauth/google/callback', googleCallback);

// Example of protected route (admin only)
authRouter.get('/admin-only', requireAuth, requireRole('ADMIN'), (_req, res) => res.json({ ok: true }));