import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function verifyEmailHandler(req: Request, res: Response) {
    try {
        const { token } = req.body ?? {};
        if (!token) return res.status(400).json({ error: 'token required' });

        const user = await prisma.user.findFirst({ where: { verificationToken: token } });
        if (!user) return res.status(400).json({ error: 'invalid token' });

        await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verificationToken: null } });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
