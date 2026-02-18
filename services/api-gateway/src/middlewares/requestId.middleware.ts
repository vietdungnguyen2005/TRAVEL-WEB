import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { runWithCorrelationId } from '@travel-web/shared';

export type RequestWithId = Request & { requestId?: string };

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
    const inbound = req.header('x-request-id');
    const requestId = (typeof inbound === 'string' && inbound.trim().length > 0) ? inbound : randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', requestId);
    return runWithCorrelationId(requestId, () => next());
}
