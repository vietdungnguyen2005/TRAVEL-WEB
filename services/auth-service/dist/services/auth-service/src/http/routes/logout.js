"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = logout;
const refresh_tokens_1 = require("../../lib/refresh-tokens");
async function logout(req, res) {
    const cookies = req.cookies;
    const refresh = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;
    if (refresh) {
        await (0, refresh_tokens_1.revokeRefreshTokenByHash)((0, refresh_tokens_1.hashRefreshToken)(refresh));
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ success: true });
}
//# sourceMappingURL=logout.js.map