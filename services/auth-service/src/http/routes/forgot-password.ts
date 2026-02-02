import type { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { sanitizeInput } from '../../lib/security';

export async function forgotPassword(req: Request, res: Response) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = sanitizeInput(emailRaw).toLowerCase().trim();
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether the email exists
            return res.status(200).json({ message: 'If the email exists, a reset token was sent' });
        }

        const token = crypto.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });

        // For production you'd email the token. For now return token for dev/testing.
        return res.status(200).json({ message: 'Reset token created', token });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
