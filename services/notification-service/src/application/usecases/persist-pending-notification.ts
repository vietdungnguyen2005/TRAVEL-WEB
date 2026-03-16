import type { NotificationRepository } from '../ports/notification-repository';
import prisma from '../../lib/prisma';
import { Logger } from '@travel-web/shared';

const logger = new Logger('PersistNotification');

/**
 * Look up user email from auth schema via cross-schema raw query.
 * All services share the same Supabase Postgres instance.
 */
async function resolveUserEmail(userId: string | null): Promise<string | null> {
    if (!userId) return null;
    try {
        const rows: { email: string }[] = await (prisma as any).$queryRawUnsafe(
            `SELECT email FROM app_auth."User" WHERE id = $1 LIMIT 1`,
            userId,
        );
        return rows?.[0]?.email ?? null;
    } catch (err) {
        logger.warn('Could not resolve user email', { userId, error: (err as Error).message });
        return null;
    }
}

/** Human-readable subject per event type */
function subjectForEvent(type: string, bookingId: string | null): string {
    const id = bookingId ? ` #${bookingId.slice(0, 8)}` : '';
    switch (type) {
        case 'BookingCreated': return `Xác nhận đặt phòng${id} – TravelBook`;
        case 'BookingConfirmed': return `Đặt phòng${id} đã được xác nhận – TravelBook`;
        case 'BookingCancelled': return `Đặt phòng${id} đã bị hủy – TravelBook`;
        case 'PaymentCompleted': return `Thanh toán thành công${id} – TravelBook`;
        case 'PaymentRefunded': return `Hoàn tiền thành công${id} – TravelBook`;
        case 'PaymentRefundFailed': return `Hoàn tiền thất bại${id} – TravelBook`;
        case 'PaymentRefundRejected': return `Yêu cầu hoàn tiền bị từ chối${id} – TravelBook`;
        case 'PaymentRefundRequested': return `Yêu cầu hoàn tiền${id} đã được gửi – TravelBook`;
        default: return `Thông báo từ TravelBook${id}`;
    }
}

export async function persistPendingNotification(deps: {
    notifications: NotificationRepository;
    input: {
        userId: string | null;
        bookingId: string | null;
        type: string;
        payload: unknown;
    };
}) {
    const { userId, bookingId, type, payload } = deps.input;

    // Resolve user email from auth DB; fall back to env or skip
    const userEmail = await resolveUserEmail(userId);
    const to = userEmail
        || process.env.NOTIFICATION_FALLBACK_EMAIL
        || null;

    if (!to) {
        logger.warn('No recipient email; skipping notification', { userId, type });
        return { status: 'SKIPPED' as const, type: type || 'UnknownEvent' };
    }

    const subject = subjectForEvent(type || 'Unknown', bookingId);

    await deps.notifications.createPending({
        userId,
        bookingId,
        type: type || 'UnknownEvent',
        to,
        subject,
        payload: (payload ?? {}) as unknown,
    });

    return { status: 'PENDING' as const, type: type || 'UnknownEvent' };
}
