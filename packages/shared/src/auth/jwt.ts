import jwt from 'jsonwebtoken';

function readPemFromEnv(envValue: string | undefined): string | undefined {
    if (!envValue) return undefined;
    const trimmed = envValue.trim();
    if (!trimmed) return undefined;
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

export type JwtUser = {
    id?: string;
    role?: string;
    email?: string;
};

export function getJwtIssuer() {
    return process.env.JWT_ISSUER;
}

export function getJwtAudience() {
    return process.env.JWT_AUDIENCE;
}

export function getJwtVerifierKeyOrThrow(): { key: string; algorithms: jwt.Algorithm[] } {
    // Production: RS256 with public key
    const publicKey = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (publicKey) {
        return { key: publicKey, algorithms: ['RS256'] };
    }

    // Backward compatibility: HS256 with shared secret
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_PUBLIC_KEY/JWT_SECRET is not set');
    return { key: secret, algorithms: ['HS256'] };
}

export function extractAccessTokenFromHeaders(headers: { authorization?: unknown; cookie?: unknown }): string | undefined {
    const authorization = typeof headers.authorization === 'string' ? headers.authorization : undefined;
    const cookieHeader = typeof headers.cookie === 'string' ? headers.cookie : undefined;

    const bearer = authorization?.toLowerCase().startsWith('bearer ') ? authorization.slice('bearer '.length).trim() : undefined;
    if (bearer) return bearer;

    const cookieToken = cookieHeader
        ?.split(';')
        .map((s) => s.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')
        .slice(1)
        .join('=');

    return cookieToken;
}

export function decodeJwtUser(payload: jwt.JwtPayload): JwtUser {
    const getStringClaim = (key: string) => {
        const value = (payload as unknown as Record<string, unknown>)[key];
        return typeof value === 'string' ? value : undefined;
    };

    return {
        id: typeof payload.sub === 'string' ? payload.sub : undefined,
        role: getStringClaim('role'),
        email: getStringClaim('email'),
    };
}

export function verifyJwtToken(token: string): jwt.JwtPayload {
    const { key, algorithms } = getJwtVerifierKeyOrThrow();
    const issuer = getJwtIssuer();
    const audience = getJwtAudience();

    const verified = jwt.verify(token, key, {
        algorithms,
        issuer: issuer || undefined,
        audience: audience || undefined,
    }) as jwt.JwtPayload | string;
    if (typeof verified === 'string') throw new Error('Invalid token');
    return verified;
}
