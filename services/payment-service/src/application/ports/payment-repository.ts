import type { Payment, PaymentStatus } from '../../domain/payment';

export type PaymentRepository = {
    findByBookingId(bookingId: string): Promise<Payment | null>;

    upsertPaymentUrl(input: {
        bookingId: string;
        userId: string;
        amount: number;
        currency: string;
        vnpTxnRef: string;
        metadata: unknown;
    }): Promise<Payment>;

    upsertDemoCompleted(input: {
        bookingId: string;
        userId: string;
        roomId?: string;
    }): Promise<Payment>;

    markCompletedByBookingId(input: {
        bookingId: string;
        vnpTransactionNo?: string;
    }): Promise<void>;

    updateStatusByBookingId(input: {
        bookingId: string;
        status: PaymentStatus;
        mergeMetadata?: Record<string, unknown>;
    }): Promise<void>;

    updateRefundMetadataByBookingId(input: {
        bookingId: string;
        status: PaymentStatus;
        mergeMetadata: Record<string, unknown>;
    }): Promise<void>;
};
