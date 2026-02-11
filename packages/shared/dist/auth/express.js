"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
exports.requireRole = requireRole;
exports.tryGetUserFromRequest = tryGetUserFromRequest;
const jwt_1 = require("./jwt");
function verifyJWT(req, res, next) {
    const token = (0, jwt_1.extractAccessTokenFromHeaders)({ authorization: req.headers.authorization, cookie: req.headers.cookie });
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const secret = (0, jwt_1.getJwtSecretOrThrow)();
        const payload = (0, jwt_1.verifyJwtToken)(token, secret);
        req.user = (0, jwt_1.decodeJwtUser)(payload);
        return next();
    }
    catch (err) {
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
// Optional helper for handlers that want to “try read” the userId.
function tryGetUserFromRequest(req) {
    const token = (0, jwt_1.extractAccessTokenFromHeaders)({ authorization: req.headers.authorization, cookie: req.headers.cookie });
    if (!token)
        return null;
    try {
        const secret = (0, jwt_1.getJwtSecretOrThrow)();
        const payload = (0, jwt_1.verifyJwtToken)(token, secret);
        return (0, jwt_1.decodeJwtUser)(payload);
    }
    catch {
        return null;
    }
}
