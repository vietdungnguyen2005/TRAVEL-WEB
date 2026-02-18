export type CreatePendingNotificationInput = {
    userId: string | null;
    bookingId: string | null;
    type: string;
    to: string;
    subject: string;
    payload: unknown;
};

export type NotificationRepository = {
    createPending(input: CreatePendingNotificationInput): Promise<void>;
};
