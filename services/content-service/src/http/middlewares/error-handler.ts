import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    void _next;
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
