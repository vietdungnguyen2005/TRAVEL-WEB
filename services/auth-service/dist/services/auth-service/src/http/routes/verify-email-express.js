"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailHandler = verifyEmailHandler;
const prisma_1 = require("../../lib/prisma");
async function verifyEmailHandler(req, res) {
    try {
        const { token } = req.body ?? {};
        if (!token)
            return res.status(400).json({ error: 'token required' });
        const user = await prisma_1.prisma.user.findFirst({ where: { verificationToken: token } });
        if (!user)
            return res.status(400).json({ error: 'invalid token' });
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verificationToken: null } });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=verify-email-express.js.map