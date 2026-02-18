import type { EventMessage } from '@travel-web/contracts';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';
import type { StripeGateway } from '../ports/stripe-gateway';

export async function handleBookingCancelledRefund(deps: {
    payments: PaymentRepository;
    publisher: EventPublisher;
    stripe: StripeGateway;
    bookingId: string;
    causationId?: string;
    sourceRoutingKey?: string;
}) {
    const bookingId = deps.bookingId;

    const payment = await deps.payments.findByBookingId(bookingId);
    if (!payment) return { skipped: true as const, reason: 'Payment not found' };

    if (payment.status === 'REFUNDED') return { skipped: true as const, reason: 'Already refunded' };

    const paymentIntentId = payment.stripePaymentIntentId;
    if (!paymentIntentId) {
        const failedId = `payment.refund.failed:${bookingId}`;
        const failed: EventMessage<'PaymentRefundFailed', { bookingId: string; reason: string }> = {
            id: failedId,
            type: 'PaymentRefundFailed',
            source: 'payment-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: bookingId,
            causationId: deps.causationId,
            data: { bookingId, reason: 'No stripePaymentIntentId found on payment record' },
        };

        await deps.publisher.publish('payment.refund.failed', failed, {
            messageId: failedId,
            correlationId: bookingId,
            headers: {
                'x-causation-id': deps.causationId,
                'x-source-routing-key': deps.sourceRoutingKey,
            },
        });

        return { skipped: true as const, reason: 'Missing stripePaymentIntentId' };
    }

    try {
        const refund = await deps.stripe.refundPaymentIntent(paymentIntentId);

        await deps.payments.updateRefundMetadataByBookingId({
            bookingId,
            status: 'REFUNDED',
            mergeMetadata: {
                refundReason: 'booking.cancelled',
                refundExecutedAt: new Date().toISOString(),
                stripeRefundId: refund.refundId,
            },
        });

        const refundedId = `payment.refund.completed:${bookingId}`;
        const refunded: EventMessage<'PaymentRefunded', { bookingId: string; userId?: string; stripeRefundId: string }> = {
            id: refundedId,
            type: 'PaymentRefunded',
            source: 'payment-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: bookingId,
            causationId: deps.causationId,
            data: { bookingId, stripeRefundId: refund.refundId },
        };

        // Keep legacy routing key for compatibility.
        await deps.publisher.publish('payment.paymentrefunded', refunded, {
            messageId: refundedId,
            correlationId: bookingId,
            headers: {
                'x-causation-id': deps.causationId,
                'x-source-routing-key': deps.sourceRoutingKey,
            },
        });

        return { ok: true as const, stripeRefundId: refund.refundId };
    } catch (err) {
        const error = err as Error;
        const failedId = `payment.refund.failed:${bookingId}`;

        const failed: EventMessage<'PaymentRefundFailed', { bookingId: string; reason: string }> = {
            id: failedId,
            type: 'PaymentRefundFailed',
            source: 'payment-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: bookingId,
            causationId: deps.causationId,
            data: { bookingId, reason: error.message },
        };

        await deps.publisher.publish('payment.refund.failed', failed, {
            messageId: failedId,
            correlationId: bookingId,
            headers: {
                'x-causation-id': deps.causationId,
                'x-source-routing-key': deps.sourceRoutingKey,
            },
        });

        throw err;
    }
}
