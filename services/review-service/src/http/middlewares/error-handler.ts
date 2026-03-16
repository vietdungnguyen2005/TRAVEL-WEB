import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    void _next;
    const statusCode = (err as { statusCode?: number }).statusCode || 500;
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(err);
    res.status(statusCode).json({ success: false, error: message });
}
