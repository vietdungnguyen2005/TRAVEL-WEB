"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthForPaths = requireAuthForPaths;
exports.requireAdminForPaths = requireAdminForPaths;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const services_config_1 = require("../config/services.config");
function getStringClaim(payload, key) {
    const value = payload[key];
    return typeof value === 'string' ? value : undefined;
}
const jwksCache = {
    fetchedAtMs: 0,
    pemByKid: new Map(),
};
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
function getIssuer() {
    return process.env.JWT_ISSUER || 'travel-web';
}
function getAudience() {
    return process.env.JWT_AUDIENCE || 'travel-web-api';
}
function getJwksUrl() {
    // Prefer explicit URL (e.g. going through internal DNS/mesh)
    if (process.env.AUTH_JWKS_URL)
        return process.env.AUTH_JWKS_URL;
    return `${services_config_1.services.authService}/.well-known/jwks.json`;
}
async function fetchJwksIfNeeded() {
    const ttlMs = Number(process.env.AUTH_JWKS_CACHE_TTL_MS || 5 * 60 * 1000);
    const now = Date.now();
    if (jwksCache.jwks && now - jwksCache.fetchedAtMs < ttlMs)
        return jwksCache.jwks;
    const url = getJwksUrl();
    const resp = await axios_1.default.get(url, { timeout: Number(process.env.AUTH_JWKS_FETCH_TIMEOUT_MS || 2000) });
    jwksCache.jwks = resp.data;
    jwksCache.fetchedAtMs = now;
    return jwksCache.jwks;
}
async function getPublicKeyPemForToken(token) {
    // Fast path: static public key configured in gateway
    const envPem = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (envPem)
        return envPem;
    const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
    const kid = decoded?.header?.kid || 'default';
    const cached = jwksCache.pemByKid.get(kid);
    const pemTtlMs = Number(process.env.AUTH_JWKS_PEM_CACHE_TTL_MS || 15 * 60 * 1000);
    if (cached && Date.now() - cached.cachedAtMs < pemTtlMs)
        return cached.pem;
    const jwks = await fetchJwksIfNeeded();
    const jwk = jwks.keys.find((k) => k.kid === kid) ?? jwks.keys[0];
    if (!jwk)
        throw new Error('No JWKS keys available');
    const pem = (0, crypto_1.createPublicKey)({ key: jwk, format: 'jwk' }).export({ format: 'pem', type: 'spki' }).toString();
    jwksCache.pemByKid.set(kid, { pem, cachedAtMs: Date.now() });
    return pem;
}
function extractBearerToken(req) {
    const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
    if (auth.toLowerCase().startsWith('bearer '))
        return auth.slice('bearer '.length).trim();
    // Optional backward compat: allow cookie access token
    const cookieHeader = typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined;
    const cookieToken = cookieHeader
        ?.split(';')
        .map((s) => s.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')
        .slice(1)
        .join('=');
    return cookieToken;
}
function requireAuthForPaths(paths) {
    return async function authMiddleware(req, res, next) {
        const shouldProtect = paths.some((p) => req.path === p || req.path.startsWith(p));
        if (!shouldProtect)
            return next();
        const token = extractBearerToken(req);
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        try {
            const publicKeyPem = await getPublicKeyPemForToken(token);
            const verified = jsonwebtoken_1.default.verify(token, publicKeyPem, {
                algorithms: ['RS256'],
                issuer: getIssuer(),
                audience: getAudience(),
            });
            if (typeof verified === 'string')
                return res.status(401).json({ error: 'Unauthorized' });
            const userId = typeof verified.sub === 'string' ? verified.sub : undefined;
            const role = getStringClaim(verified, 'role');
            const typ = getStringClaim(verified, 'typ');
            if (!userId || !role)
                return res.status(401).json({ error: 'Unauthorized' });
            if (typ && typ !== 'access')
                return res.status(401).json({ error: 'Unauthorized' });
            req.auth = { userId, role };
            return next();
        }
        catch {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
}
function requireAdminForPaths(paths) {
    return function adminGuard(req, res, next) {
        const isAdminPath = paths.some((p) => req.path === p || req.path.startsWith(p));
        if (!isAdminPath)
            return next();
        const role = req.auth?.role;
        if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: admin access required' });
        }
        return next();
    };
}
//# sourceMappingURL=auth.middleware.js.map