import Stripe from 'stripe';

let cached: Stripe | null | undefined;

export function getStripeClient(): Stripe | null {
    if (cached !== undefined) return cached;

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        cached = null;
        return cached;
    }

    cached = new Stripe(key, {
        apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
    });

    return cached;
}
