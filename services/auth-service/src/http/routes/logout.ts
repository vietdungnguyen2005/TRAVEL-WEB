import type { Request, Response } from 'express';
import { hashRefreshToken, revokeRefreshTokenByHash } from '../../lib/refresh-tokens';

type RequestWithCookies = Request & { cookies?: Record<string, unknown> };

export async function logout(req: Request, res: Response) {
    const cookies = (req as RequestWithCookies).cookies;
    const refresh = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;
    if (refresh) {
        await revokeRefreshTokenByHash(hashRefreshToken(refresh));
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ success: true });
}
