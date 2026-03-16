import type { Request, Response } from 'express';
import { hashRefreshToken, revokeRefreshTokenByHash } from '../../lib/refresh-tokens';

type RequestWithCookies = Request & { cookies?: Record<string, unknown> };

export async function logout(req: Request, res: Response) {
    const cookies = (req as RequestWithCookies).cookies;
    const cookieToken = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;

    // Also accept refreshToken from request body (for clients that can't send cookies,
    // e.g. when the gateway strips Set-Cookie headers and the frontend API route
    // forwards the token via body instead of cookie).
    const bodyToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;

    const refresh = cookieToken ?? bodyToken;
    if (refresh) {
        await revokeRefreshTokenByHash(hashRefreshToken(refresh));
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ success: true });
}
