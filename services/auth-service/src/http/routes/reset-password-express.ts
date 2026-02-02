import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { sanitizeInput } from '../../lib/security';

export async function resetPasswordHandler(req: Request, res: Response) {
    try {
        const { token, password } = req.body ?? {};
        if (!token || !password) return res.status(400).json({ error: 'token and password required' });
        if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'password too short' });

        const resetToken = await prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!resetToken) return res.status(400).json({ error: 'Invalid reset token' });

        if (!resetToken.resetPasswordExpires || resetToken.resetPasswordExpires < new Date()) {
            await prisma.user.update({ where: { id: resetToken.id }, data: { resetPasswordToken: null, resetPasswordExpires: null } });
            return res.status(400).json({ error: 'Reset token expired' });
        }

        const hashed = await bcrypt.hash(sanitizeInput(password), 10);
        await prisma.user.update({ where: { id: resetToken.id }, data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null } });

        return res.status(200).json({ success: true });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
