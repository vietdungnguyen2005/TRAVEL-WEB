"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = resetPasswordHandler;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../lib/prisma");
const security_1 = require("../../lib/security");
async function resetPasswordHandler(req, res) {
    try {
        const { token, password } = req.body ?? {};
        if (!token || !password)
            return res.status(400).json({ error: 'token and password required' });
        if (typeof password !== 'string' || password.length < 8)
            return res.status(400).json({ error: 'password too short' });
        const resetToken = await prisma_1.prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!resetToken)
            return res.status(400).json({ error: 'Invalid reset token' });
        if (!resetToken.resetPasswordExpires || resetToken.resetPasswordExpires < new Date()) {
            await prisma_1.prisma.user.update({ where: { id: resetToken.id }, data: { resetPasswordToken: null, resetPasswordExpires: null } });
            return res.status(400).json({ error: 'Reset token expired' });
        }
        const hashed = await bcrypt_1.default.hash((0, security_1.sanitizeInput)(password), 10);
        await prisma_1.prisma.user.update({ where: { id: resetToken.id }, data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null } });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=reset-password-express.js.map