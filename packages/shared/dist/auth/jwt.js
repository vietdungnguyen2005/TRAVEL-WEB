"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtIssuer = getJwtIssuer;
exports.getJwtAudience = getJwtAudience;
exports.getJwtVerifierKeyOrThrow = getJwtVerifierKeyOrThrow;
exports.extractAccessTokenFromHeaders = extractAccessTokenFromHeaders;
exports.decodeJwtUser = decodeJwtUser;
exports.verifyJwtToken = verifyJwtToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function readPemFromEnv(envValue) {
    if (!envValue)
        return undefined;
    const trimmed = envValue.trim();
    if (!trimmed)
        return undefined;
    if (trimmed.includes('BEGIN ') && trimmed.includes('\\n')) {
        return trimmed.replace(/\\n/g, '\n');
    }
    return trimmed;
}
function readPemOrBase64(envPem, envBase64) {
    const pem = readPemFromEnv(envPem);
    if (pem)
        return pem;
    const b64 = envBase64?.trim();
    if (!b64)
        return undefined;
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return readPemFromEnv(decoded);
}
function getJwtIssuer() {
    return process.env.JWT_ISSUER;
}
function getJwtAudience() {
    return process.env.JWT_AUDIENCE;
}
function getJwtVerifierKeyOrThrow() {
    // Production: RS256 with public key
    const publicKey = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (publicKey) {
        return { key: publicKey, algorithms: ['RS256'] };
    }
    // Backward compatibility: HS256 with shared secret
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_PUBLIC_KEY/JWT_SECRET is not set');
    return { key: secret, algorithms: ['HS256'] };
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
    const getStringClaim = (key) => {
        const value = payload[key];
        return typeof value === 'string' ? value : undefined;
    };
    return {
        id: typeof payload.sub === 'string' ? payload.sub : undefined,
        role: getStringClaim('role'),
        email: getStringClaim('email'),
    };
}
function verifyJwtToken(token) {
    const { key, algorithms } = getJwtVerifierKeyOrThrow();
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();
    const verified = jsonwebtoken_1.default.verify(token, key, {
        algorithms,
        issuer: issuer || undefined,
        audience: audience || undefined,
    });
    if (typeof verified === 'string')
        throw new Error('Invalid token');
    return verified;
}
