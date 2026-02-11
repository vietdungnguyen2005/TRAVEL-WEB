import type { Request, Response } from 'express';
import amqp from 'amqplib';
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

async function checkRabbitMq() {
    if (process.env.DISABLE_RABBITMQ === 'true') return;

    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL is not set');

    const timeoutMs = getTimeoutMs();
    const conn = await withTimeout(amqp.connect(url), timeoutMs, 'RabbitMQ connect');
    await withTimeout(conn.close(), timeoutMs, 'RabbitMQ close');
}

export function healthHandler(_req: Request, res: Response) {
    checkDb()
        .then(() => res.status(200).json({ status: 'ok' }))
        .catch((err) => res.status(503).json({ status: 'fail', dependency: 'db', error: (err as Error).message }));
}

export function readyHandler(_req: Request, res: Response) {
    Promise.all([checkDb(), checkRabbitMq()])
        .then(() => res.status(200).json({ status: 'ready' }))
        .catch((err) => {
            const message = (err as Error).message;
            res.status(503).json({ status: 'not-ready', error: message });
        });
}
