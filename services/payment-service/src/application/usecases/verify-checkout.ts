import type { EventMessage } from '@travel-web/contracts';
import type { StripeGateway } from '../ports/stripe-gateway';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';

export async function verifyCheckout(deps: {
    stripe: StripeGateway;
    payments: PaymentRepository;
    publisher: EventPublisher;
    sessionId: string;
}) {
    if (!deps.sessionId) throw new Error('Session ID is required');

    const session = await deps.stripe.retrieveCheckoutSession(deps.sessionId);
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) throw new Error('Booking ID not found in session metadata');

    if (session.payment_status !== 'paid') {
        return { ok: false as const, bookingId, error: 'Payment not completed' };
    }

    await deps.payments.markCompletedByBookingId({
        bookingId,
        stripePaymentIntentId: session.payment_intent || undefined,
    });

    const event: EventMessage<'PaymentCompleted', { bookingId: string; userId?: string; stripePaymentIntentId?: string }> = {
        id: `payment.completed:${bookingId}:${String(session.payment_intent || '')}`,
        type: 'PaymentCompleted',
        source: 'payment-service',
        occurredAt: new Date().toISOString(),
        version: 1,
        correlationId: bookingId,
        data: {
            bookingId,
            userId: typeof session.metadata?.userId === 'string' ? session.metadata.userId : undefined,
            stripePaymentIntentId: session.payment_intent || undefined,
        },
    };

    await deps.publisher.publish('payment.completed', event, {
        messageId: event.id,
        correlationId: bookingId,
    });

    return { ok: true as const, bookingId, paymentIntentId: session.payment_intent };
}
