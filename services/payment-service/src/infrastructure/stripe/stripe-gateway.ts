import type Stripe from 'stripe';
import type { StripeGateway } from '../../application/ports/stripe-gateway';

export function createStripeGateway(stripe: Stripe | null): StripeGateway {
    return {
        async createCheckoutSession(input) {
            if (!stripe) throw new Error('Stripe is not configured');

            const checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: input.currency,
                            product_data: {
                                name: `Booking ${String(input.bookingId).slice(0, 8).toUpperCase()}`,
                            },
                            unit_amount: Math.round(Number(input.amount)),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                customer_email: input.email,
                client_reference_id: input.bookingId,
                success_url: `${input.appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${input.appUrl}/booking/cancel?booking_id=${input.bookingId}`,
                metadata: { bookingId: input.bookingId, userId: input.userId ?? null },
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
            });

            return { id: checkoutSession.id, url: checkoutSession.url };
        },

        async retrieveCheckoutSession(sessionId: string) {
            if (!stripe) throw new Error('Stripe is not configured');
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            return {
                id: session.id,
                url: session.url,
                metadata: session.metadata,
                payment_status: session.payment_status,
                payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            };
        },

        async refundPaymentIntent(paymentIntentId: string) {
            if (!stripe) throw new Error('Stripe is not configured');
            const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
            return { refundId: refund.id };
        },
    };
}
