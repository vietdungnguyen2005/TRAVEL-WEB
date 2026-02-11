"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecretOrThrow = getJwtSecretOrThrow;
exports.extractAccessTokenFromHeaders = extractAccessTokenFromHeaders;
exports.decodeJwtUser = decodeJwtUser;
exports.verifyJwtToken = verifyJwtToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJwtSecretOrThrow() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function extractAccessTokenFromHeaders(headers) {
    const authorization = typeof headers.authorization === 'string' ? headers.authorization : undefined;
    const cookieHeader = typeof headers.cookie === 'string' ? headers.cookie : undefined;
    const bearer = authorization?.toLowerCase().startsWith('bearer ') ? authorization.slice('bearer '.length).trim() : undefined;
    if (bearer)
        return bearer;
    const cookieToken = cookieHeader
        ?.split(';')
        .map((s) => s.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')
        .slice(1)
        .join('=');
    return cookieToken;
}
function decodeJwtUser(payload) {
    return {
        id: typeof payload.sub === 'string' ? payload.sub : undefined,
        role: typeof payload.role === 'string' ? payload.role : undefined,
        email: typeof payload.email === 'string' ? payload.email : undefined,
    };
}
function verifyJwtToken(token, secret) {
    const verified = jsonwebtoken_1.default.verify(token, secret);
    if (typeof verified === 'string')
        throw new Error('Invalid token');
    return verified;
}
