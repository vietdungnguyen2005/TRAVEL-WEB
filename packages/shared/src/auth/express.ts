import type { NextFunction, Request, Response } from 'express';
import { decodeJwtUser, extractAccessTokenFromHeaders, verifyJwtToken, type JwtUser } from './jwt';

type AuthedRequest = Request & { user?: JwtUser };

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    const token = extractAccessTokenFromHeaders({ authorization: req.headers.authorization, cookie: req.headers.cookie });
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const payload = verifyJwtToken(token);
        (req as AuthedRequest).user = decodeJwtUser(payload);
        return next();
    } catch (err) {
        if (err instanceof Error && err.message.includes('is not set')) {
            return res.status(500).json({ error: 'Server misconfigured' });
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export function requireRole(role: string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const user = (req as AuthedRequest).user;
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
        const payload = verifyJwtToken(token);
        return decodeJwtUser(payload);
    } catch {
        return null;
    }
}
