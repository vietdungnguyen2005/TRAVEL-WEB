import type { NotificationRepository } from '../ports/notification-repository';

export async function persistPendingNotification(deps: {
    notifications: NotificationRepository;
    input: {
        userId: string | null;
        bookingId: string | null;
        type: string;
        payload: unknown;
    };
}) {
    const to = String(process.env.NOTIFICATION_FALLBACK_EMAIL || 'unknown@example.com');
    const subject = `Event: ${deps.input.type || 'Unknown'}`;

    await deps.notifications.createPending({
        userId: deps.input.userId,
        bookingId: deps.input.bookingId,
        type: deps.input.type || 'UnknownEvent',
        to,
        subject,
        payload: (deps.input.payload ?? {}) as unknown,
    });

    return { status: 'PENDING' as const, type: deps.input.type || 'UnknownEvent' };
}
