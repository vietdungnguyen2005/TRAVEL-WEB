import type { NextFunction, Request, Response } from 'express';
import { decodeJwtUser, extractAccessTokenFromHeaders, getJwtSecretOrThrow, verifyJwtToken } from './jwt';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    const token = extractAccessTokenFromHeaders({ authorization: req.headers.authorization, cookie: req.headers.cookie });
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const secret = getJwtSecretOrThrow();
        const payload = verifyJwtToken(token, secret);
        (req as any).user = decodeJwtUser(payload);
        return next();
    } catch (err) {
        if (err instanceof Error && err.message === 'JWT_SECRET is not set') {
            return res.status(500).json({ error: 'Server misconfigured' });
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export function requireRole(role: string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user as { role?: string } | undefined;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        if (user.role !== role) return res.status(403).json({ error: 'Forbidden' });
        return next();
    };
}

// Optional helper for handlers that want to “try read” the userId.
export function tryGetUserFromRequest(req: Request) {
    const token = extractAccessTokenFromHeaders({ authorization: req.headers.authorization, cookie: req.headers.cookie });
    if (!token) return null;
    try {
        const secret = getJwtSecretOrThrow();
        const payload = verifyJwtToken(token, secret);
        return decodeJwtUser(payload);
    } catch {
        return null;
    }
}
