export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export type Notification = {
    id: string;
    userId: string | null;
    bookingId: string | null;
    type: string;
    channel: 'EMAIL';
    to: string;
    subject: string;
    payload: unknown;
    status: NotificationStatus;
    attempts: number;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
};
