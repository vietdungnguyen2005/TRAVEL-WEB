import type { Request, Response } from 'express';
import prisma from './prisma';

function getTimeoutMs() {
    const raw = process.env.HEALTHCHECK_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let timeout: NodeJS.Timeout | null = null;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
            }),
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

async function checkDb() {
    const timeoutMs = getTimeoutMs();
    await withTimeout(prisma.$queryRaw`SELECT 1`, timeoutMs, 'DB check');
}

export function healthHandler(_req: Request, res: Response) {
    checkDb()
        .then(() => res.status(200).json({ status: 'ok' }))
        .catch((err) => res.status(503).json({ status: 'fail', dependency: 'db', error: (err as Error).message }));
}

export function readyHandler(_req: Request, res: Response) {
    checkDb()
        .then(() => res.status(200).json({ status: 'ready' }))
        .catch((err) => res.status(503).json({ status: 'not-ready', error: (err as Error).message }));
}
