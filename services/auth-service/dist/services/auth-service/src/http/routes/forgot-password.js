"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = forgotPassword;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../lib/prisma");
const security_1 = require("../../lib/security");
const nodemailer_email_service_1 = require("../../infrastructure/email/nodemailer.email.service");
async function forgotPassword(req, res) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = (0, security_1.sanitizeInput)(emailRaw).toLowerCase().trim();
        if (!email)
            return res.status(400).json({ message: 'Email là bắt buộc' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether the email exists
            // Don't reveal whether the email exists - same message for both cases
            return res.status(200).json({ message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' });
        }
        const token = crypto_1.default.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });
        const webAppUrl = process.env.WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${webAppUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
        try {
            const emailService = new nodemailer_email_service_1.NodemailerEmailService();
            await emailService.sendResetPasswordEmail({ to: email, resetUrl, name: user.name ?? undefined });
        }
        catch (emailErr) {
            console.error('[auth-service] Failed to send reset password email:', emailErr);
            // Still return success to not reveal email existence
        }
        return res.status(200).json({ message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
//# sourceMappingURL=forgot-password.js.map