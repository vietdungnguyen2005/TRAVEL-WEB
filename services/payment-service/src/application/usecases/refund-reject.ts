import type { IdempotencyStore } from '../ports/idempotency-store';
import type { EventPublisher } from '../ports/event-publisher';
import type { PaymentRepository } from '../ports/payment-repository';

export async function refundReject(deps: {
    idempotency: IdempotencyStore;
    payments: PaymentRepository;
    publisher: EventPublisher;
    idemKey: string;
    bookingId: string;
    adminNote?: string;
}) {
    const existing = await deps.idempotency.getResponse('refund-reject', deps.idemKey);
    if (existing) return { status: existing.statusCode, body: existing.body };

    const started = await deps.idempotency.begin('refund-reject', deps.idemKey, deps.bookingId);
    if (!started.ok) {
        const maybe = await deps.idempotency.getResponse('refund-reject', deps.idemKey);
        if (maybe) return { status: maybe.statusCode, body: maybe.body };
        return { status: 409, body: { error: 'Idempotency key is already in progress' } };
    }

    const payment = await deps.payments.findByBookingId(deps.bookingId);
    if (!payment) {
        const body = { error: 'Payment not found' };
        await deps.idempotency.saveResponse('refund-reject', deps.idemKey, 404, body);
        return { status: 404, body };
    }

    // Already rejected → idempotent
    if (payment.status === 'REFUND_REJECTED') {
        const body = { success: true, bookingId: deps.bookingId, status: payment.status };
        await deps.idempotency.saveResponse('refund-reject', deps.idemKey, 200, body);
        return { status: 200, body };
    }

    // Only REFUND_REQUESTED payments can be rejected
    if (payment.status !== 'REFUND_REQUESTED') {
        const body = { error: `Cannot reject refund for payment with status ${payment.status}` };
        await deps.idempotency.saveResponse('refund-reject', deps.idemKey, 400, body);
        return { status: 400, body };
    }

    await deps.payments.updateRefundMetadataByBookingId({
        bookingId: deps.bookingId,
        status: 'REFUND_REJECTED',
        mergeMetadata: {
            refundRejectedAt: new Date().toISOString(),
            refundAdminNote: deps.adminNote || null,
        },
    });

    await deps.publisher.publish('payment.refundrejected', {
        type: 'RefundRejected',
        bookingId: deps.bookingId,
        userId: payment.userId,
        at: new Date().toISOString(),
    });

    const body = { success: true, bookingId: deps.bookingId, status: 'REFUND_REJECTED' };
    await deps.idempotency.saveResponse('refund-reject', deps.idemKey, 200, body);
    return { status: 200, body };
}
