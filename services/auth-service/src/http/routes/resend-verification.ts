import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { randomBytes } from 'crypto';

export async function resendVerificationEmailHandler(req: Request, res: Response) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = emailRaw.toLowerCase().trim();
        if (!email) return res.status(400).json({ error: 'email required' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether email exists
            return res.status(200).json({ success: true });
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, alreadyVerified: true });
        }

        const token = randomBytes(24).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } });

        // For production you'd email the token / verification link.
        return res.status(200).json({ success: true, verificationToken: token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
