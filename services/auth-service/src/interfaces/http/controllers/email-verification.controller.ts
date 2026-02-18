import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthError } from '../../../application/auth/auth.errors';
import { VerifyEmailUseCase } from '../../../application/auth/usecases/verify-email.usecase';
import { ResendVerificationUseCase } from '../../../application/auth/usecases/resend-verification.usecase';
import { PrismaUserRepository } from '../../../infrastructure/prisma/user.prisma.repository';
import { PrismaEmailVerificationRepository } from '../../../infrastructure/prisma/email-verification.prisma.repository';
import { NodemailerEmailService } from '../../../infrastructure/email/nodemailer.email.service';

function mapAuthError(err: unknown, res: Response) {
    if (err instanceof AuthError) {
        if (err.code === 'INVALID_VERIFICATION_TOKEN') return res.status(400).json({ error: 'invalid token' });
        if (err.code === 'EXPIRED_VERIFICATION_TOKEN') return res.status(400).json({ error: 'expired token' });
        return res.status(400).json({ error: 'bad request' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}

const deps = {
    users: new PrismaUserRepository(),
    emailVerifications: new PrismaEmailVerificationRepository(),
    email: new NodemailerEmailService(),
    webAppUrl: (process.env.WEB_APP_URL || '').replace(/\/+$/, '') || undefined,
};

export async function verifyEmail(req: Request, res: Response) {
    const rawToken = typeof req.query?.token === 'string' ? req.query.token : (req.body?.token as string | undefined);
    const parsed = z.object({ token: z.string().min(10) }).safeParse({ token: rawToken });
    if (!parsed.success) return res.status(400).json({ error: 'token required' });

    try {
        const uc = new VerifyEmailUseCase({ users: deps.users, emailVerifications: deps.emailVerifications });
        await uc.execute({ token: parsed.data.token });
        return res.status(200).json({ success: true });
    } catch (err) {
        return mapAuthError(err, res);
    }
}

export async function resendVerificationEmail(req: Request, res: Response) {
    const parsed = z.object({ email: z.string().email() }).safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'email required' });

    try {
        const uc = new ResendVerificationUseCase({
            users: deps.users,
            emailVerifications: deps.emailVerifications,
            email: deps.email,
            webAppUrl: deps.webAppUrl,
        });

        const result = await uc.execute({ email: parsed.data.email });
        return res.status(200).json(result);
    } catch (err) {
        return mapAuthError(err, res);
    }
}
