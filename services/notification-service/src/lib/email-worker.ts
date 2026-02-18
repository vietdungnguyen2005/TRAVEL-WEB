import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import prisma from './prisma';
import { Logger } from '@travel-web/shared';

const logger = new Logger('EmailWorker');

function getNumberEnv(name: string, defaultValue: number) {
    const raw = process.env[name];
    const parsed = raw ? Number(raw) : defaultValue;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function getBoolEnv(name: string, defaultValue: boolean) {
    const raw = process.env[name];
    if (!raw) return defaultValue;
    return raw === 'true' || raw === '1' || raw === 'yes';
}

function getEmailProvider() {
    const emailFrom = process.env.EMAIL_FROM || process.env.FROM_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const smtpUrl = process.env.SMTP_URL;

    if (resendKey && emailFrom) {
        const resend = new Resend(resendKey);
        return {
            kind: 'resend' as const,
            emailFrom,
            async send(to: string, subject: string, text: string) {
                await resend.emails.send({
                    from: emailFrom,
                    to,
                    subject,
                    text,
                });
            },
        };
    }

    if (sendgridKey && emailFrom) {
        sgMail.setApiKey(sendgridKey);
        return {
            kind: 'sendgrid' as const,
            emailFrom,
            async send(to: string, subject: string, text: string) {
                await sgMail.send({ to, from: emailFrom, subject, text });
            },
        };
    }

    if (smtpUrl && emailFrom) {
        const transport = nodemailer.createTransport(smtpUrl);
        return {
            kind: 'smtp' as const,
            emailFrom,
            async send(to: string, subject: string, text: string) {
                await transport.sendMail({ from: emailFrom, to, subject, text });
            },
        };
    }

    return null;
}

function getRetryDelayMs(attempts: number) {
    // attempts is the number of failed attempts already recorded.
    // After 1st failure: wait 5s, after 2nd: 30s, after 3rd+: 5m.
    if (attempts <= 0) return 0;
    if (attempts === 1) return 5_000;
    if (attempts === 2) return 30_000;
    return 300_000;
}

export async function startEmailWorker() {
    const enabled = getBoolEnv('ENABLE_EMAIL_WORKER', false);
    if (!enabled) {
        logger.warn('ENABLE_EMAIL_WORKER is not true; skipping email worker');
        return;
    }

    const provider = getEmailProvider();
    if (!provider) {
        logger.warn('Email provider not configured (set RESEND_API_KEY+EMAIL_FROM, SENDGRID_API_KEY+EMAIL_FROM, or SMTP_URL+EMAIL_FROM); skipping email worker');
        return;
    }

    const batchSize = getNumberEnv('EMAIL_WORKER_BATCH_SIZE', 20);
    const pollMs = getNumberEnv('EMAIL_WORKER_POLL_INTERVAL_MS', 1500);
    const maxAttempts = getNumberEnv('EMAIL_WORKER_MAX_ATTEMPTS', 4);

    logger.info('Email worker started', { provider: provider.kind, batchSize, pollMs, maxAttempts });

    while (true) {
        const now = new Date();
        const t5s = new Date(now.getTime() - 5_000);
        const t30s = new Date(now.getTime() - 30_000);
        const t5m = new Date(now.getTime() - 300_000);

        const candidates = await prisma.notification.findMany({
            where: {
                attempts: { lt: maxAttempts },
                OR: [
                    { status: 'PENDING' },
                    { status: 'FAILED', attempts: 1, updatedAt: { lte: t5s } },
                    { status: 'FAILED', attempts: 2, updatedAt: { lte: t30s } },
                    { status: 'FAILED', attempts: { gte: 3 }, updatedAt: { lte: t5m } },
                ],
            },
            orderBy: { updatedAt: 'asc' },
            take: batchSize,
        });

        if (candidates.length === 0) {
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
        }

        for (const n of candidates) {
            const to = n.to;
            const subject = n.subject || `Notification: ${n.type}`;
            const payloadText = n.payload ? JSON.stringify(n.payload, null, 2) : '';
            const body = [
                `Type: ${n.type}`,
                n.bookingId ? `BookingId: ${n.bookingId}` : null,
                n.userId ? `UserId: ${n.userId}` : null,
                '',
                payloadText,
            ].filter(Boolean).join('\n');

            // Guard: in case a row somehow becomes eligible too early.
            const waitMs = getRetryDelayMs(n.attempts);
            if (n.status === 'FAILED' && waitMs > 0) {
                const ageMs = Date.now() - n.updatedAt.getTime();
                if (ageMs < waitMs) continue;
            }

            try {
                await provider.send(to, subject, body);

                await prisma.notification.update({
                    where: { id: n.id },
                    data: {
                        status: 'SENT',
                        error: null,
                    },
                });

                logger.info('Email sent', { id: n.id, to, type: n.type });
            } catch (err) {
                const error = err as Error;

                await prisma.notification.update({
                    where: { id: n.id },
                    data: {
                        status: 'FAILED',
                        attempts: { increment: 1 },
                        error: error.message,
                    },
                });

                logger.error(
                    'Email send failed',
                    {
                        id: n.id,
                        to,
                        type: n.type,
                        attempts: n.attempts + 1,
                        nextDelayMs: getRetryDelayMs(n.attempts + 1),
                    },
                    error,
                );
            }
        }

        await new Promise((r) => setTimeout(r, pollMs));
    }
}
