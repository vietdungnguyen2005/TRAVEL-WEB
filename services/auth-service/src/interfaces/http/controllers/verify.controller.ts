import type { Request, Response } from 'express';
import { z } from 'zod';
import { verifyAccessTokenOrThrow } from '../../../lib/jwt.rs256';

export async function verifyToken(req: Request, res: Response) {
    const schema = z.object({ token: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }

    try {
        const payload = verifyAccessTokenOrThrow(parsed.data.token);
        return res.status(200).json({ verified: true, payload });
    } catch {
        return res.status(401).json({ verified: false });
    }
}
