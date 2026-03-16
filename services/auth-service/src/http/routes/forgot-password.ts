import type { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { sanitizeInput } from '../../lib/security';
import { NodemailerEmailService } from '../../infrastructure/email/nodemailer.email.service';

export async function forgotPassword(req: Request, res: Response) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = sanitizeInput(emailRaw).toLowerCase().trim();
        if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether the email exists
            // Don't reveal whether the email exists - same message for both cases
            return res.status(200).json({ message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' });
        }

        const token = crypto.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });

        const webAppUrl = process.env.WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${webAppUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

        try {
            const emailService = new NodemailerEmailService();
            await emailService.sendResetPasswordEmail({ to: email, resetUrl, name: user.name ?? undefined });
        } catch (emailErr) {
            console.error('[auth-service] Failed to send reset password email:', emailErr);
            // Still return success to not reveal email existence
        }

        return res.status(200).json({ message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
