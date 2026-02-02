import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return secret;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        const auth = req.headers.authorization || req.cookies?.access_token;
        if (!auth) return next(new Error('Unauthorized'));
        const token = typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : auth;
        const payload = jwt.verify(token as string, getJwtSecret()) as any;
        // attach minimal user info
        (req as any).user = { id: payload.sub, role: payload.role, email: payload.email };
        return next();
    } catch (err) {
        return next(new Error('Unauthorized'));
    }
}

export function requireRole(role: string) {
    return function (req: Request, _res: Response, next: NextFunction) {
        const u = (req as any).user;
        if (!u) return next(new Error('Unauthorized'));
        if (u.role !== role) return next(new Error('Forbidden'));
        return next();
    };
}
