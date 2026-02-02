"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = logout;
async function logout(req, res) {
    // If using cookie-based sessions, clear cookie
    res.clearCookie('access_token');
    return res.status(200).json({ success: true });
}
//# sourceMappingURL=logout.js.map