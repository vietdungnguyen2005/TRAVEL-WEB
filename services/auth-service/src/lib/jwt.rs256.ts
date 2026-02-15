import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';
import { createPublicKey } from 'crypto';

export type AccessTokenClaims = {
    sub: string;
    role: string;
    typ: 'access';
};

export type VerifiedAccessToken = JwtPayload & {
    sub: string;
    role: string;
    typ?: string;
};

function readPemFromEnv(envValue: string | undefined): string | undefined {
    if (!envValue) return undefined;
    const trimmed = envValue.trim();
    if (!trimmed) return undefined;

    // Allow passing PEM as a single line with \n
    if (trimmed.includes('BEGIN ') && trimmed.includes('\\n')) {
        return trimmed.replace(/\\n/g, '\n');
    }

    return trimmed;
}

function readPemOrBase64(envPem: string | undefined, envBase64: string | undefined): string | undefined {
    const pem = readPemFromEnv(envPem);
    if (pem) return pem;

    const b64 = envBase64?.trim();
    if (!b64) return undefined;
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return readPemFromEnv(decoded);
}

export function getJwtIssuer() {
    return process.env.JWT_ISSUER || 'travel-web';
}

export function getJwtAudience() {
    return process.env.JWT_AUDIENCE || 'travel-web-api';
}

export function getJwtKeyId() {
    return process.env.JWT_KID || 'auth-key-1';
}

export function getAccessTokenTtl() {
    // Requirement: 10-15 minutes
    return (process.env.JWT_ACCESS_TTL || '15m') as SignOptions['expiresIn'];
}

export function getPrivateKeyPemOrThrow() {
    const pem = readPemOrBase64(process.env.JWT_PRIVATE_KEY, process.env.JWT_PRIVATE_KEY_BASE64);
    if (!pem) throw new Error('JWT_PRIVATE_KEY (or JWT_PRIVATE_KEY_BASE64) is not set');
    return pem;
}

export function getPublicKeyPemOrThrow() {
    const pem = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (!pem) throw new Error('JWT_PUBLIC_KEY (or JWT_PUBLIC_KEY_BASE64) is not set');
    return pem;
}

export function signAccessToken(claims: { userId: string; role: string }) {
    const privateKey = getPrivateKeyPemOrThrow();
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();

    const payload: AccessTokenClaims = {
        sub: claims.userId,
        role: claims.role,
        typ: 'access',
    };

    const opts: SignOptions = {
        algorithm: 'RS256',
        expiresIn: getAccessTokenTtl(),
        issuer,
        audience,
        keyid: getJwtKeyId(),
    };

    return jwt.sign(payload, privateKey, opts);
}

export function verifyAccessTokenOrThrow(token: string): VerifiedAccessToken {
    const publicKey = getPublicKeyPemOrThrow();
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();

    const verified = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer,
        audience,
    }) as JwtPayload | string;

    if (typeof verified === 'string') throw new Error('Invalid token');
    return verified as VerifiedAccessToken;
}

export function getJwks() {
    const publicKeyPem = getPublicKeyPemOrThrow();
    const kid = getJwtKeyId();
    const keyObject = createPublicKey(publicKeyPem);
    const jwk = keyObject.export({ format: 'jwk' }) as Record<string, unknown>;

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
