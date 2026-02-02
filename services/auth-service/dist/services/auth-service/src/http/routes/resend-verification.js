"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmailHandler = resendVerificationEmailHandler;
const prisma_1 = require("../../lib/prisma");
const crypto_1 = require("crypto");
async function resendVerificationEmailHandler(req, res) {
    try {
        const emailRaw = (req.body?.email ?? '').toString();
        const email = emailRaw.toLowerCase().trim();
        if (!email)
            return res.status(400).json({ error: 'email required' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether email exists
            return res.status(200).json({ success: true });
        }
        if (user.isVerified) {
            return res.status(200).json({ success: true, alreadyVerified: true });
        }
        const token = (0, crypto_1.randomBytes)(24).toString('hex');
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } });
        // For production you'd email the token / verification link.
        return res.status(200).json({ success: true, verificationToken: token });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=resend-verification.js.map