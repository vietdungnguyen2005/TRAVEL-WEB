export type IdempotencyScope = 'refund' | 'refund-approve' | 'refund-reject' | 'vnpay-ipn';

export type IdempotencyStore = {
    begin(scope: IdempotencyScope, key: string, bookingId?: string): Promise<{ ok: true } | { ok: false; conflict: true }>;
    getResponse(scope: IdempotencyScope, key: string): Promise<{ statusCode: number; body: unknown } | null>;
    saveResponse(scope: IdempotencyScope, key: string, statusCode: number, body: unknown): Promise<void>;
};
