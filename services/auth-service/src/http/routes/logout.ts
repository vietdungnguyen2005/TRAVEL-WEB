import type { Request, Response } from 'express';
import { hashRefreshToken, revokeRefreshTokenByHash } from '../../lib/refresh-tokens';

export async function logout(req: Request, res: Response) {
    const refresh = typeof (req as any).cookies?.refresh_token === 'string' ? (req as any).cookies.refresh_token : undefined;
    if (refresh) {
        await revokeRefreshTokenByHash(hashRefreshToken(refresh));
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ success: true });
}
