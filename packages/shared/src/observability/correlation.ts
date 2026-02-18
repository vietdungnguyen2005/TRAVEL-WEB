import type { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

type CorrelationStore = {
    correlationId?: string;
};

const storage = new AsyncLocalStorage<CorrelationStore>();

export function getCorrelationId(): string | undefined {
    return storage.getStore()?.correlationId;
}

export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
    return storage.run({ correlationId }, fn);
}

export function ensureCorrelationId(existing?: string): string {
    const cleaned = typeof existing === 'string' ? existing.trim() : '';
    if (cleaned) return cleaned;
    const fromContext = getCorrelationId();
    if (fromContext) return fromContext;
    return randomUUID();
}

export function createCorrelationIdMiddleware() {
    return function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
        const header = req.header('x-correlation-id') || req.header('x-request-id');
        const correlationId = ensureCorrelationId(header || undefined);

        res.setHeader('x-correlation-id', correlationId);
        (req as Request & { correlationId?: string }).correlationId = correlationId;

        return runWithCorrelationId(correlationId, () => next());
    };
}
