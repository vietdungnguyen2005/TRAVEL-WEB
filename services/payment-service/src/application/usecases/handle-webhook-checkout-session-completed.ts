import type Stripe from 'stripe';
import type { EventMessage } from '@travel-web/contracts';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';
import type { IdempotencyStore } from '../ports/idempotency-store';

export async function handleWebhookCheckoutSessionCompleted(deps: {
    idempotency: IdempotencyStore;
    payments: PaymentRepository;
    publisher: EventPublisher;
    stripeEventId: string;
    session: Stripe.Checkout.Session;
}) {
    const idemKey = deps.stripeEventId;

    const existing = await deps.idempotency.getResponse('stripe-webhook', idemKey);
    if (existing) return { status: existing.statusCode, body: existing.body };

    const started = await deps.idempotency.begin('stripe-webhook', idemKey, deps.session.metadata?.bookingId);
    if (!started.ok) {
        const maybe = await deps.idempotency.getResponse('stripe-webhook', idemKey);
        if (maybe) return { status: maybe.statusCode, body: maybe.body };
        // If still in-progress, ack to Stripe to avoid retries storm; processing will complete eventually.
        return { status: 200, body: { received: true, inProgress: true } };
    }

    const bookingId = deps.session.metadata?.bookingId;
    if (bookingId) {
        await deps.payments.markCompletedByBookingId({
            bookingId,
            stripePaymentIntentId: typeof deps.session.payment_intent === 'string' ? deps.session.payment_intent : undefined,
        });

        const out: EventMessage<'PaymentCompleted', { bookingId: string; userId?: string; stripePaymentIntentId?: string }> = {
            id: `payment.completed:${bookingId}:${String(deps.session.payment_intent || '')}`,
            type: 'PaymentCompleted',
            source: 'payment-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: bookingId,
            data: {
                bookingId,
                userId: typeof deps.session.metadata?.userId === 'string' ? deps.session.metadata.userId : undefined,
                stripePaymentIntentId: typeof deps.session.payment_intent === 'string' ? deps.session.payment_intent : undefined,
            },
        };

        await deps.publisher.publish('payment.completed', out, {
            messageId: out.id,
            correlationId: bookingId,
        });
    }

    const body = { received: true };
    await deps.idempotency.saveResponse('stripe-webhook', idemKey, 200, body);
    return { status: 200, body };
}
