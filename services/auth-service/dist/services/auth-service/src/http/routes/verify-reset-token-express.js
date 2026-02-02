"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetTokenHandler = verifyResetTokenHandler;
const prisma_1 = require("../../lib/prisma");
async function verifyResetTokenHandler(req, res) {
    try {
        const token = (req.query?.token ?? req.body?.token ?? '').toString();
        if (!token)
            return res.status(400).json({ error: 'token required' });
        const u = await prisma_1.prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!u)
            return res.status(400).json({ valid: false });
        if (!u.resetPasswordExpires || u.resetPasswordExpires < new Date())
            return res.status(400).json({ valid: false });
        return res.status(200).json({ valid: true });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=verify-reset-token-express.js.map