import type { StripeGateway } from '../ports/stripe-gateway';
import type { PaymentRepository } from '../ports/payment-repository';

export async function createCheckout(deps: {
    stripe: StripeGateway;
    payments: PaymentRepository;
    input: {
        bookingId: string;
        userId?: string;
        email: string;
        amount: number;
        currency: string;
        appUrl: string;
    };
}) {
    const { bookingId, userId, email, amount, currency, appUrl } = deps.input;
    if (!bookingId || !email || !amount) {
        throw new Error('bookingId, email, amount are required');
    }

    const session = await deps.stripe.createCheckoutSession({
        bookingId,
        userId,
        email,
        amount,
        currency,
        appUrl,
    });

    await deps.payments.upsertCheckoutSession({
        bookingId,
        userId: String(userId || 'unknown'),
        amount: Number(amount),
        currency,
        stripeCheckoutSessionId: session.id,
        metadata: { bookingId, userId },
    });

    return { sessionId: session.id, url: session.url };
}
