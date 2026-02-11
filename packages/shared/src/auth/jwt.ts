import jwt from 'jsonwebtoken';

export type JwtUser = {
    id?: string;
    role?: string;
    email?: string;
};

export function getJwtSecretOrThrow() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return secret;
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
    return {
        id: typeof payload.sub === 'string' ? payload.sub : undefined,
        role: typeof (payload as any).role === 'string' ? (payload as any).role : undefined,
        email: typeof (payload as any).email === 'string' ? (payload as any).email : undefined,
    };
}

export function verifyJwtToken(token: string, secret: string): jwt.JwtPayload {
    const verified = jwt.verify(token, secret) as jwt.JwtPayload | string;
    if (typeof verified === 'string') throw new Error('Invalid token');
    return verified;
}
