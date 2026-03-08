import type { EventMessage } from '@travel-web/contracts';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';

export async function handleBookingCancelledRefund(deps: {
    payments: PaymentRepository;
    publisher: EventPublisher;
    bookingId: string;
    causationId?: string;
    sourceRoutingKey?: string;
}) {
    const bookingId = deps.bookingId;

    const payment = await deps.payments.findByBookingId(bookingId);
    if (!payment) return { skipped: true as const, reason: 'Payment not found' };

    if (payment.status === 'REFUNDED') return { skipped: true as const, reason: 'Already refunded' };

    // VNPay: refund is manual – just update DB status and publish event
    await deps.payments.updateRefundMetadataByBookingId({
        bookingId,
        status: 'REFUNDED',
        mergeMetadata: {
            refundReason: 'booking.cancelled',
            refundExecutedAt: new Date().toISOString(),
            refundNote: 'Manual refund required (VNPay)',
        },
    });

    const refundedId = `payment.refund.completed:${bookingId}`;
    const refunded: EventMessage<'PaymentRefunded', { bookingId: string; userId?: string }> = {
        id: refundedId,
        type: 'PaymentRefunded',
        source: 'payment-service',
        occurredAt: new Date().toISOString(),
        version: 1,
        correlationId: bookingId,
        causationId: deps.causationId,
        data: { bookingId },
    };

    await deps.publisher.publish('payment.paymentrefunded', refunded, {
        messageId: refundedId,
        correlationId: bookingId,
        headers: {
            'x-causation-id': deps.causationId,
            'x-source-routing-key': deps.sourceRoutingKey,
        },
    });

    return { ok: true as const };
}
