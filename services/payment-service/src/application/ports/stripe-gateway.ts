export type StripeCheckoutSession = {
    id: string;
    url: string | null;
    metadata?: Record<string, string> | null;
    payment_status?: string;
    payment_intent?: string | null;
};

export type StripeGateway = {
    createCheckoutSession(input: {
        bookingId: string;
        userId?: string;
        email: string;
        amount: number;
        currency: string;
        appUrl: string;
    }): Promise<{ id: string; url: string | null }>;

    retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession>;

    refundPaymentIntent(paymentIntentId: string): Promise<{ refundId: string }>;
};
