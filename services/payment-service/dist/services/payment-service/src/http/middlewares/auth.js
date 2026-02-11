"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    const bearer = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice('bearer '.length).trim() : undefined;
    if (bearer)
        return bearer;
    // Support forwarded cookie auth from gateway/web.
    const cookieHeader = req.headers.cookie;
    const cookieToken = cookieHeader
        ?.split(';')
        .map((s) => s.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')
        .slice(1)
        .join('=');
    return cookieToken;
}
function verifyJWT(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (typeof payload === 'string')
            return res.status(401).json({ error: 'Unauthorized' });
        const user = {
            id: typeof payload.sub === 'string' ? payload.sub : undefined,
            role: typeof payload.role === 'string' ? payload.role : undefined,
            email: typeof payload.email === 'string' ? payload.email : undefined,
        };
        req.user = user;
        return next();
    }
    catch (err) {
        // If server is misconfigured (missing secret), avoid leaking details.
        if (err instanceof Error && err.message === 'JWT_SECRET is not set') {
            return res.status(500).json({ error: 'Server misconfigured' });
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
function requireRole(role) {
    return function (req, res, next) {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (user.role !== role)
            return res.status(403).json({ error: 'Forbidden' });
        return next();
    };
}
//# sourceMappingURL=auth.js.map