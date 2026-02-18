import type { IdempotencyStore } from '../ports/idempotency-store';
import type { EventPublisher } from '../ports/event-publisher';
import type { PaymentRepository } from '../ports/payment-repository';

export async function refundDirect(deps: {
    idempotency: IdempotencyStore;
    payments: PaymentRepository;
    publisher: EventPublisher;
    idemKey: string;
    bookingId: string;
    reason?: string;
}) {
    const existing = await deps.idempotency.getResponse('refund', deps.idemKey);
    if (existing) return { status: existing.statusCode, body: existing.body };

    const started = await deps.idempotency.begin('refund', deps.idemKey, deps.bookingId);
    if (!started.ok) {
        const maybe = await deps.idempotency.getResponse('refund', deps.idemKey);
        if (maybe) return { status: maybe.statusCode, body: maybe.body };
        return { status: 409, body: { error: 'Idempotency key is already in progress' } };
    }

    const payment = await deps.payments.findByBookingId(deps.bookingId);
    if (!payment) {
        const body = { error: 'Payment not found' };
        await deps.idempotency.saveResponse('refund', deps.idemKey, 404, body);
        return { status: 404, body };
    }

    if (payment.status === 'REFUNDED') {
        const body = { success: true, bookingId: deps.bookingId, alreadyRefunded: true };
        await deps.idempotency.saveResponse('refund', deps.idemKey, 200, body);
        return { status: 200, body };
    }

    await deps.payments.updateRefundMetadataByBookingId({
        bookingId: deps.bookingId,
        status: 'REFUNDED',
        mergeMetadata: {
            refundReason: deps.reason || 'requested',
            refundExecutedAt: new Date().toISOString(),
        },
    });

    await deps.publisher.publish('payment.paymentrefunded', {
        type: 'PaymentRefunded',
        bookingId: deps.bookingId,
        userId: payment.userId,
        reason: deps.reason || 'requested',
        at: new Date().toISOString(),
    });

    const body = { success: true, bookingId: deps.bookingId };
    await deps.idempotency.saveResponse('refund', deps.idemKey, 200, body);
    return { status: 200, body };
}
