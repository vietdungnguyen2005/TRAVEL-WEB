import type { IdempotencyStore } from '../ports/idempotency-store';
import type { EventPublisher } from '../ports/event-publisher';
import type { PaymentRepository } from '../ports/payment-repository';

export function getIdempotencyKeyFromHeaders(headers: Record<string, unknown>) {
    const key = headers['idempotency-key'] || headers['x-idempotency-key'];
    return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

export async function refundApprove(deps: {
    idempotency: IdempotencyStore;
    payments: PaymentRepository;
    publisher: EventPublisher;
    idemKey: string;
    bookingId: string;
    adminNote?: string;
}) {
    const existing = await deps.idempotency.getResponse('refund-approve', deps.idemKey);
    if (existing) return { status: existing.statusCode, body: existing.body };

    const started = await deps.idempotency.begin('refund-approve', deps.idemKey, deps.bookingId);
    if (!started.ok) {
        const maybe = await deps.idempotency.getResponse('refund-approve', deps.idemKey);
        if (maybe) return { status: maybe.statusCode, body: maybe.body };
        return { status: 409, body: { error: 'Idempotency key is already in progress' } };
    }

    const payment = await deps.payments.findByBookingId(deps.bookingId);
    if (!payment) {
        const body = { error: 'Payment not found' };
        await deps.idempotency.saveResponse('refund-approve', deps.idemKey, 404, body);
        return { status: 404, body };
    }

    if (payment.status === 'REFUNDED') {
        const body = { success: true, bookingId: deps.bookingId, alreadyRefunded: true };
        await deps.idempotency.saveResponse('refund-approve', deps.idemKey, 200, body);
        return { status: 200, body };
    }

    await deps.payments.updateRefundMetadataByBookingId({
        bookingId: deps.bookingId,
        status: 'REFUNDED',
        mergeMetadata: {
            refundApprovedAt: new Date().toISOString(),
            refundAdminNote: deps.adminNote || null,
            refundExecutedAt: new Date().toISOString(),
        },
    });

    await deps.publisher.publish('payment.paymentrefunded', {
        type: 'PaymentRefunded',
        bookingId: deps.bookingId,
        userId: payment.userId,
        reason: 'approved',
        at: new Date().toISOString(),
    });

    const body = { success: true, bookingId: deps.bookingId };
    await deps.idempotency.saveResponse('refund-approve', deps.idemKey, 200, body);
    return { status: 200, body };
}
