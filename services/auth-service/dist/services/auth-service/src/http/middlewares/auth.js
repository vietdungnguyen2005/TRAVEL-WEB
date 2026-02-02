"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function requireAuth(req, _res, next) {
    try {
        const auth = req.headers.authorization || req.cookies?.access_token;
        if (!auth)
            return next(new Error('Unauthorized'));
        const token = typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : auth;
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        // attach minimal user info
        req.user = { id: payload.sub, role: payload.role, email: payload.email };
        return next();
    }
    catch (err) {
        return next(new Error('Unauthorized'));
    }
}
function requireRole(role) {
    return function (req, _res, next) {
        const u = req.user;
        if (!u)
            return next(new Error('Unauthorized'));
        if (u.role !== role)
            return next(new Error('Forbidden'));
        return next();
    };
}
//# sourceMappingURL=auth.js.map