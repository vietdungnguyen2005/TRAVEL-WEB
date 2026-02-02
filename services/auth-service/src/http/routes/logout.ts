import type { Request, Response } from 'express';

export async function logout(req: Request, res: Response) {
    // If using cookie-based sessions, clear cookie
    res.clearCookie('access_token');
    return res.status(200).json({ success: true });
}
