import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function verifyResetTokenHandler(req: Request, res: Response) {
    try {
        const token = (req.query?.token ?? req.body?.token ?? '').toString();
        if (!token) return res.status(400).json({ valid: false, message: 'Token là bắt buộc' });

        const u = await prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!u) return res.status(400).json({ valid: false });
        if (!u.resetPasswordExpires || u.resetPasswordExpires < new Date()) return res.status(400).json({ valid: false, message: 'Token đã hết hạn' });

        return res.status(200).json({ valid: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ valid: false, message: 'Lỗi hệ thống' });
    }
}
