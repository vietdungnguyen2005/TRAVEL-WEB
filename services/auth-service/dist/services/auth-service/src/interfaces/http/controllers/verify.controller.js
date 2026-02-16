"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const zod_1 = require("zod");
const jwt_rs256_1 = require("../../../lib/jwt.rs256");
async function verifyToken(req, res) {
    const schema = zod_1.z.object({ token: zod_1.z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }
    try {
        const payload = (0, jwt_rs256_1.verifyAccessTokenOrThrow)(parsed.data.token);
        return res.status(200).json({ verified: true, payload });
    }
    catch {
        return res.status(401).json({ verified: false });
    }
}
//# sourceMappingURL=verify.controller.js.map