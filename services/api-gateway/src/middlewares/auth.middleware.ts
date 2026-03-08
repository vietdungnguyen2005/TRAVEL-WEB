import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import { createPublicKey } from 'crypto';
import { services } from '../config/services.config';

export type AuthContext = {
    userId: string;
    role: string;
};

export type RequestWithAuth = Request & { auth?: AuthContext };

type Jwks = { keys: Array<Record<string, unknown>> };

function getStringClaim(payload: JwtPayload, key: string): string | undefined {
    const value = (payload as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
}

const jwksCache: {
    fetchedAtMs: number;
    jwks?: Jwks;
    pemByKid: Map<string, { pem: string; cachedAtMs: number }>;
} = {
    fetchedAtMs: 0,
    pemByKid: new Map(),
};

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

function getIssuer() {
    return process.env.JWT_ISSUER || 'travel-web';
}

function getAudience() {
    return process.env.JWT_AUDIENCE || 'travel-web-api';
}

function getJwksUrl() {
    // Prefer explicit URL (e.g. going through internal DNS/mesh)
    if (process.env.AUTH_JWKS_URL) return process.env.AUTH_JWKS_URL;
    return `${services.authService}/.well-known/jwks.json`;
}

async function fetchJwksIfNeeded() {
    const ttlMs = Number(process.env.AUTH_JWKS_CACHE_TTL_MS || 5 * 60 * 1000);
    const now = Date.now();
    if (jwksCache.jwks && now - jwksCache.fetchedAtMs < ttlMs) return jwksCache.jwks;

    const url = getJwksUrl();
    const resp = await axios.get(url, { timeout: Number(process.env.AUTH_JWKS_FETCH_TIMEOUT_MS || 2000) });
    jwksCache.jwks = resp.data as Jwks;
    jwksCache.fetchedAtMs = now;
    return jwksCache.jwks;
}

async function getPublicKeyPemForToken(token: string) {
    // Fast path: static public key configured in gateway
    const envPem = readPemOrBase64(process.env.JWT_PUBLIC_KEY, process.env.JWT_PUBLIC_KEY_BASE64);
    if (envPem) return envPem;

    const decoded = jwt.decode(token, { complete: true }) as { header?: { kid?: string } } | null;
    const kid = decoded?.header?.kid || 'default';

    const cached = jwksCache.pemByKid.get(kid);
    const pemTtlMs = Number(process.env.AUTH_JWKS_PEM_CACHE_TTL_MS || 15 * 60 * 1000);
    if (cached && Date.now() - cached.cachedAtMs < pemTtlMs) return cached.pem;

    const jwks = await fetchJwksIfNeeded();
    const jwk = jwks.keys.find((k) => k.kid === kid) ?? jwks.keys[0];
    if (!jwk) throw new Error('No JWKS keys available');

    const pem = createPublicKey({ key: jwk, format: 'jwk' }).export({ format: 'pem', type: 'spki' }).toString();
    jwksCache.pemByKid.set(kid, { pem, cachedAtMs: Date.now() });
    return pem;
}

function extractBearerToken(req: Request) {
    const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
    if (auth.toLowerCase().startsWith('bearer ')) return auth.slice('bearer '.length).trim();

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

function getJwtSecret() {
    return process.env.JWT_SECRET?.trim() || undefined;
}

export function requireAuthForPaths(paths: string[], publicExceptions: string[] = []) {
    return async function authMiddleware(req: Request, res: Response, next: NextFunction) {
        // Skip auth for explicitly public paths
        if (publicExceptions.some((p) => req.path === p || req.path.startsWith(p))) return next();

        const shouldProtect = paths.some((p) => req.path === p || req.path.startsWith(p));
        if (!shouldProtect) return next();

        const token = extractBearerToken(req);
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        try {
            let verified: JwtPayload | string | undefined;

            // Try RS256 first (production path with RSA keys / JWKS)
            try {
                const publicKeyPem = await getPublicKeyPemForToken(token);
                verified = jwt.verify(token, publicKeyPem, {
                    algorithms: ['RS256'],
                    issuer: getIssuer(),
                    audience: getAudience(),
                }) as JwtPayload | string;
            } catch {
                // Fallback: HS256 (dev mode when RSA keys are not configured)
                const secret = getJwtSecret();
                if (secret) {
                    verified = jwt.verify(token, secret, {
                        algorithms: ['HS256'],
                        issuer: getIssuer(),
                        audience: getAudience(),
                    }) as JwtPayload | string;
                }
            }

            if (!verified || typeof verified === 'string') return res.status(401).json({ error: 'Unauthorized' });

            const userId = typeof verified.sub === 'string' ? verified.sub : undefined;
            const role = getStringClaim(verified, 'role');
            const typ = getStringClaim(verified, 'typ');

            if (!userId || !role) return res.status(401).json({ error: 'Unauthorized' });
            if (typ && typ !== 'access') return res.status(401).json({ error: 'Unauthorized' });

            (req as RequestWithAuth).auth = { userId, role };
            return next();
        } catch {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
}

export function requireAdminForPaths(paths: string[]) {
    return function adminGuard(req: Request, res: Response, next: NextFunction) {
        const isAdminPath = paths.some((p) => req.path === p || req.path.startsWith(p));
        if (!isAdminPath) return next();

        const role = (req as RequestWithAuth).auth?.role;
        if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: admin access required' });
        }
        return next();
    };
}
