"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = forgotPassword;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../lib/prisma");
const security_1 = require("../../lib/security");
async function forgotPassword(req, res) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = (0, security_1.sanitizeInput)(emailRaw).toLowerCase().trim();
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether the email exists
            return res.status(200).json({ message: 'If the email exists, a reset token was sent' });
        }
        const token = crypto_1.default.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });
        // For production you'd email the token. For now return token for dev/testing.
        return res.status(200).json({ message: 'Reset token created', token });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=forgot-password.js.map