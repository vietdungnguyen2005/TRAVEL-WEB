import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';

export async function resetPasswordHandler(req: Request, res: Response) {
    try {
        const { token, password } = req.body ?? {};
        if (!token || !password) return res.status(400).json({ message: 'Token và mật khẩu là bắt buộc' });
        if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });

        const resetToken = await prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!resetToken) return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ' });

        if (!resetToken.resetPasswordExpires || resetToken.resetPasswordExpires < new Date()) {
            await prisma.user.update({ where: { id: resetToken.id }, data: { resetPasswordToken: null, resetPasswordExpires: null } });
            return res.status(400).json({ message: 'Token đặt lại mật khẩu đã hết hạn' });
        }

        // Never sanitize passwords - sanitizeInput strips characters like < > which
        // corrupts the password. The password is hashed, so XSS is not a concern.
        const hashed = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: resetToken.id }, data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null } });

        return res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
