export const PAYMENT_STATUSES = [
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUND_REQUESTED',
    'REFUND_APPROVED',
    'REFUND_REJECTED',
    'REFUNDED',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type Payment = {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    vnpTxnRef: string | null;
    vnpTransactionNo: string | null;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
};
