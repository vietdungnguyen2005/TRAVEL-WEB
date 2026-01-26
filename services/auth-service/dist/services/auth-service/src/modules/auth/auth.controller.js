"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.verifyToken = verifyToken;
async function register(req, res) {
    res.json({ success: true });
}
async function login(req, res) {
    res.json({ success: true });
}
async function verifyToken(req, res) {
    res.json({ verified: true });
}
//# sourceMappingURL=auth.controller.js.map