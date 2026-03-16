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
            async send(to: string, subject: string, text: string, html?: string) {
                await resend.emails.send({
                    from: emailFrom,
                    to,
                    subject,
                    ...(html ? { html } : { text }),
                });
            },
        };
    }

    if (sendgridKey && emailFrom) {
        sgMail.setApiKey(sendgridKey);
        return {
            kind: 'sendgrid' as const,
            emailFrom,
            async send(to: string, subject: string, text: string, html?: string) {
                await sgMail.send({ to, from: emailFrom, subject, text, ...(html ? { html } : {}) });
            },
        };
    }

    if (smtpUrl && emailFrom) {
        const transport = nodemailer.createTransport(smtpUrl);
        return {
            kind: 'smtp' as const,
            emailFrom,
            async send(to: string, subject: string, text: string, html?: string) {
                await transport.sendMail({ from: emailFrom, to, subject, text, ...(html ? { html } : {}) });
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

// ─── Email template helpers ─────────────────────────────────────────────────

function formatCurrency(amount: unknown): string {
    const n = Number(amount);
    if (!Number.isFinite(n)) return String(amount ?? '');
    return n.toLocaleString('vi-VN') + ' ₫';
}

function formatDate(dateStr: unknown): string {
    if (!dateStr || typeof dateStr !== 'string') return String(dateStr ?? '');
    try {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch {
        return String(dateStr);
    }
}

function emailLayout(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 32px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🏨 TravelBook</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 20px;color:#1e293b;font-size:20px">${title}</h2>
    ${bodyContent}
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;color:#94a3b8;font-size:12px">
    © ${new Date().getFullYear()} TravelBook. Mọi quyền được bảo lưu.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function detailRow(label: string, value: string): string {
    return `<tr><td style="padding:8px 0;color:#64748b;width:160px">${label}</td><td style="padding:8px 0;color:#1e293b;font-weight:500">${value}</td></tr>`;
}

function buildEmailHtml(type: string, bookingId: string | null, data: Record<string, unknown>): string {
    const id = bookingId ? bookingId.slice(0, 8) : '—';
    const webUrl = process.env.WEB_APP_URL || 'http://localhost:3000';

    const detailsTable = (rows: string) =>
        `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tbody style="font-size:14px">${rows}</tbody></table>`;

    const ctaButton = (text: string, href: string, color = '#1e40af') =>
        `<div style="text-align:center;margin:24px 0"><a href="${href}" style="display:inline-block;background:${color};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">${text}</a></div>`;

    switch (type) {
        case 'BookingCreated': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                data.checkIn ? detailRow('Nhận phòng', formatDate(data.checkIn)) : '',
                data.checkOut ? detailRow('Trả phòng', formatDate(data.checkOut)) : '',
                data.totalPrice ? detailRow('Tổng tiền', formatCurrency(data.totalPrice)) : '',
            ].join('');
            return emailLayout('Đặt phòng thành công!',
                `<p style="color:#475569;line-height:1.6">Cảm ơn bạn đã đặt phòng tại TravelBook. Vui lòng thanh toán để hoàn tất đặt phòng.</p>`
                + detailsTable(rows)
                + ctaButton('Xem đặt phòng', `${webUrl}/dashboard`)
            );
        }

        case 'BookingConfirmed': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '✅ Đã xác nhận'),
            ].join('');
            return emailLayout('Đặt phòng đã xác nhận!',
                `<p style="color:#475569;line-height:1.6">Đặt phòng của bạn đã được xác nhận thành công. Chúc bạn có chuyến đi vui vẻ!</p>`
                + detailsTable(rows)
                + ctaButton('Xem chi tiết', `${webUrl}/dashboard`)
            );
        }

        case 'PaymentCompleted': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '✅ Thanh toán thành công'),
                data.paymentMethod ? detailRow('Phương thức', String(data.paymentMethod)) : '',
            ].join('');
            return emailLayout('Thanh toán thành công!',
                `<p style="color:#475569;line-height:1.6">Thanh toán cho đặt phòng của bạn đã được xử lý thành công.</p>`
                + detailsTable(rows)
                + ctaButton('Xem đặt phòng', `${webUrl}/dashboard`)
            );
        }

        case 'BookingCancelled': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '❌ Đã hủy'),
                data.reason ? detailRow('Lý do', String(data.reason)) : '',
            ].join('');
            return emailLayout('Đặt phòng đã bị hủy',
                `<p style="color:#475569;line-height:1.6">Đặt phòng của bạn đã được hủy.</p>`
                + detailsTable(rows)
                + ctaButton('Đặt phòng mới', `${webUrl}/rooms`, '#059669')
            );
        }

        case 'PaymentRefunded': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '💰 Đã hoàn tiền'),
                data.reason ? detailRow('Lý do', String(data.reason)) : '',
            ].join('');
            return emailLayout('Hoàn tiền thành công',
                `<p style="color:#475569;line-height:1.6">Yêu cầu hoàn tiền của bạn đã được xử lý. Tiền sẽ được trả lại trong 5-7 ngày làm việc.</p>`
                + detailsTable(rows)
            );
        }

        case 'PaymentRefundRejected': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '⛔ Bị từ chối'),
            ].join('');
            return emailLayout('Yêu cầu hoàn tiền bị từ chối',
                `<p style="color:#475569;line-height:1.6">Rất tiếc, yêu cầu hoàn tiền của bạn không được chấp thuận. Vui lòng liên hệ hỗ trợ nếu cần thêm thông tin.</p>`
                + detailsTable(rows)
                + ctaButton('Liên hệ hỗ trợ', `${webUrl}/contact`)
            );
        }

        case 'PaymentRefundRequested': {
            const rows = [
                detailRow('Mã đặt phòng', `#${id}`),
                detailRow('Trạng thái', '⏳ Đang xử lý'),
                data.reason ? detailRow('Lý do', String(data.reason)) : '',
            ].join('');
            return emailLayout('Yêu cầu hoàn tiền đã được gửi',
                `<p style="color:#475569;line-height:1.6">Chúng tôi đã nhận được yêu cầu hoàn tiền của bạn. Quản trị viên sẽ xem xét và phản hồi sớm nhất.</p>`
                + detailsTable(rows)
            );
        }

        default: {
            return emailLayout('Thông báo từ TravelBook',
                `<p style="color:#475569;line-height:1.6">Bạn có một thông báo mới.</p>`
                + (bookingId ? detailsTable(detailRow('Mã đặt phòng', `#${id}`)) : '')
                + ctaButton('Xem dashboard', `${webUrl}/dashboard`)
            );
        }
    }
}

function buildEmailText(type: string, bookingId: string | null, data: Record<string, unknown>): string {
    const id = bookingId ? bookingId.slice(0, 8) : '';
    const lines: string[] = [];

    switch (type) {
        case 'BookingCreated':
            lines.push('Đặt phòng thành công!', `Mã: #${id}`);
            if (data.checkIn) lines.push(`Nhận phòng: ${formatDate(data.checkIn)}`);
            if (data.checkOut) lines.push(`Trả phòng: ${formatDate(data.checkOut)}`);
            if (data.totalPrice) lines.push(`Tổng tiền: ${formatCurrency(data.totalPrice)}`);
            break;
        case 'PaymentCompleted':
            lines.push('Thanh toán thành công!', `Mã đặt phòng: #${id}`);
            break;
        case 'BookingConfirmed':
            lines.push('Đặt phòng đã xác nhận!', `Mã: #${id}`);
            break;
        case 'BookingCancelled':
            lines.push('Đặt phòng đã hủy', `Mã: #${id}`);
            break;
        case 'PaymentRefunded':
            lines.push('Hoàn tiền thành công', `Mã: #${id}`);
            break;
        default:
            lines.push(`Thông báo: ${type}`, id ? `Mã: #${id}` : '');
    }

    return lines.filter(Boolean).join('\n');
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

    let consecutiveDbErrors = 0;

    while (true) {
        try {
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

            consecutiveDbErrors = 0; // Reset on successful query

            if (candidates.length === 0) {
                await new Promise((r) => setTimeout(r, pollMs));
                continue;
            }

            for (const n of candidates) {
                const to = n.to;
                const subject = n.subject || `Thông báo từ TravelBook`;
                const payload = (n.payload ?? {}) as Record<string, unknown>;
                const html = buildEmailHtml(n.type, n.bookingId, payload);
                const text = buildEmailText(n.type, n.bookingId, payload);

                // Guard: in case a row somehow becomes eligible too early.
                const waitMs = getRetryDelayMs(n.attempts);
                if (n.status === 'FAILED' && waitMs > 0) {
                    const ageMs = Date.now() - n.updatedAt.getTime();
                    if (ageMs < waitMs) continue;
                }

                try {
                    await provider.send(to, subject, text, html);

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

                    try {
                        await prisma.notification.update({
                            where: { id: n.id },
                            data: {
                                status: 'FAILED',
                                attempts: { increment: 1 },
                                error: error.message,
                            },
                        });
                    } catch (dbErr) {
                        // DB might also be down; log but don't crash — the row
                        // will be retried on the next successful poll cycle.
                        logger.error('Failed to update notification after send error', { id: n.id }, dbErr as Error);
                    }

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
        } catch (err) {
            // Transient DB errors (connection closed, pool timeout, etc.)
            // Back off exponentially: 3s, 6s, 12s, …, capped at 60s.
            consecutiveDbErrors++;
            const backoffMs = Math.min(3_000 * Math.pow(2, consecutiveDbErrors - 1), 60_000);
            logger.error(
                'Email worker poll error, retrying after backoff',
                { consecutiveErrors: consecutiveDbErrors, backoffMs },
                err as Error,
            );
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
        }

        await new Promise((r) => setTimeout(r, pollMs));
    }
}
