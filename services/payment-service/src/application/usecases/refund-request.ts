import type { EventPublisher } from '../ports/event-publisher';
import type { PaymentRepository } from '../ports/payment-repository';

export async function refundRequest(deps: {
    payments: PaymentRepository;
    publisher: EventPublisher;
    input: { bookingId: string; reason?: string };
}) {
    const { bookingId, reason } = deps.input;
    if (!bookingId) throw new Error('bookingId is required');

    const payment = await deps.payments.findByBookingId(bookingId);
    if (!payment) return { status: 404 as const, body: { error: 'Payment not found' } };

    if (payment.status === 'REFUND_REQUESTED') {
        return { status: 200 as const, body: { success: true, bookingId, status: payment.status } };
    }

    if (payment.status === 'REFUNDED') {
        return { status: 400 as const, body: { error: 'Payment already refunded' } };
    }

    // Only COMPLETED payments can request refund (can't refund what hasn't been paid)
    if (payment.status !== 'COMPLETED') {
        return { status: 400 as const, body: { error: `Cannot request refund for payment with status ${payment.status}` } };
    }

    await deps.payments.updateRefundMetadataByBookingId({
        bookingId,
        status: 'REFUND_REQUESTED',
        mergeMetadata: {
            refundRequestReason: reason || 'requested',
            refundRequestedAt: new Date().toISOString(),
        },
    });

    // Publish event (non-blocking — DB update is the source of truth)
    try {
        await deps.publisher.publish('payment.refundrequested', {
            type: 'RefundRequested',
            bookingId,
            userId: payment.userId,
            reason: reason || 'requested',
            at: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Failed to publish refund-requested event (non-fatal):', err);
    }

    return { status: 200 as const, body: { success: true, bookingId, status: 'REFUND_REQUESTED' } };
}
