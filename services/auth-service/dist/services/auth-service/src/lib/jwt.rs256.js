"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtIssuer = getJwtIssuer;
exports.getJwtAudience = getJwtAudience;
exports.getJwtKeyId = getJwtKeyId;
exports.getAccessTokenTtl = getAccessTokenTtl;
exports.getPrivateKeyPemOrThrow = getPrivateKeyPemOrThrow;
exports.getPublicKeyPemOrThrow = getPublicKeyPemOrThrow;
exports.signAccessToken = signAccessToken;
exports.verifyAccessTokenOrThrow = verifyAccessTokenOrThrow;
exports.getJwks = getJwks;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
function readPemFromEnv(envValue) {
    if (!envValue)
        return undefined;
    const trimmed = envValue.trim();
    if (!trimmed)
        return undefined;
    // Allow passing PEM as a single line with \n
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
    return process.env.JWT_ISSUER || 'travel-web';
}
function getJwtAudience() {
    return process.env.JWT_AUDIENCE || 'travel-web-api';
}
function getJwtKeyId() {
    return process.env.JWT_KID || 'auth-key-1';
}
function getAccessTokenTtl() {
    // Requirement: 10-15 minutes
    return (process.env.JWT_ACCESS_TTL || '15m');
}
function getPrivateKeyPemOrThrow() {
    const pem = readPemOrBase64(process.env.JWT_PRIVATE_KEY, process.env.JWT_PRIVATE_KEY_BASE64);
    if (!pem)
        throw new Error('JWT_PRIVATE_KEY (or JWT_PRIVATE_KEY_BASE64) is not set');
    return pem;
}
function getJwtSecretOrThrow() {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function tryGetPrivateKeyPem() {
    return readPemOrBase64(process.env.JWT_PRIVATE_KEY, process.env.JWT_PRIVATE_KEY_BASE64);
}
function tryGetPublicKeyPem() {
    return readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
}
function getPublicKeyPemOrThrow() {
    const pem = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (!pem)
        throw new Error('JWT_PUBLIC_KEY (or JWT_PUBLIC_KEY_BASE64) is not set');
    return pem;
}
function signAccessToken(claims) {
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();
    const payload = {
        sub: claims.userId,
        role: claims.role,
        typ: 'access',
    };
    const privateKey = tryGetPrivateKeyPem();
    if (privateKey) {
        const opts = {
            algorithm: 'RS256',
            expiresIn: getAccessTokenTtl(),
            issuer,
            audience,
            keyid: getJwtKeyId(),
        };
        return jsonwebtoken_1.default.sign(payload, privateKey, opts);
    }
    // Dev/backward-compat mode: sign HS256 when RSA keys are not configured.
    const secret = getJwtSecretOrThrow();
    const opts = {
        algorithm: 'HS256',
        expiresIn: getAccessTokenTtl(),
        issuer,
        audience,
    };
    return jsonwebtoken_1.default.sign(payload, secret, opts);
}
function verifyAccessTokenOrThrow(token) {
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();
    const publicKey = tryGetPublicKeyPem();
    const verified = jsonwebtoken_1.default.verify(token, publicKey || getJwtSecretOrThrow(), {
        algorithms: [publicKey ? 'RS256' : 'HS256'],
        issuer,
        audience,
    });
    if (typeof verified === 'string')
        throw new Error('Invalid token');
    return verified;
}
function getJwks() {
    const publicKeyPem = getPublicKeyPemOrThrow();
    const kid = getJwtKeyId();
    const keyObject = (0, crypto_1.createPublicKey)(publicKeyPem);
    const jwk = keyObject.export({ format: 'jwk' });
    return {
        keys: [
            {
                ...jwk,
                use: 'sig',
                alg: 'RS256',
                kid,
            },
        ],
    };
}
//# sourceMappingURL=jwt.rs256.js.map