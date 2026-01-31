import type { Request, Response } from 'express';

export function healthHandler(_req: Request, res: Response) {
    res.status(200).json({ status: 'ok' });
}

export function readyHandler(_req: Request, res: Response) {
    // TODO: add readiness checks (DB, RabbitMQ) if needed
    res.status(200).json({ status: 'ready' });
}
