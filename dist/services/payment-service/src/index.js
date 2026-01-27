import express from 'express';
import Stripe from 'stripe';
import prisma from './lib/prisma';
import { consulRegisterService, rabbitPublish } from '@travel-web/shared';
import { config as dotenvConfig } from 'dotenv';
const app = express();
const PORT = process.env.PORT || 3004;
dotenvConfig({ path: '../../.env' });
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
    : null;
// JSON routes
app.use(express.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'payment-service' });
});
// Create checkout session
app.post('/api/payments/create-checkout', async (req, res) => {
    if (!stripe)
        return res.status(500).json({ error: 'Stripe is not configured' });
    const { bookingId, userId, email, amount, currency = 'vnd' } = req.body || {};
    if (!bookingId || !userId || !email || !amount) {
        return res.status(400).json({ error: 'bookingId, userId, email, amount are required' });
    }
    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: `Booking ${String(bookingId).slice(0, 8).toUpperCase()}`,
                    },
                    unit_amount: Math.round(Number(amount)),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        customer_email: email,
        client_reference_id: bookingId,
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/booking/cancel?booking_id=${bookingId}`,
        metadata: { bookingId, userId },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    await prisma.payment.upsert({
        where: { bookingId },
        create: {
            bookingId,
            userId,
            amount: Number(amount),
            currency,
            status: 'PENDING',
            stripeCheckoutSessionId: checkoutSession.id,
            metadata: { bookingId, userId },
        },
        update: {
            amount: Number(amount),
            currency,
            status: 'PENDING',
            stripeCheckoutSessionId: checkoutSession.id,
            metadata: { bookingId, userId },
        },
    });
    return res.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
});
// Verify payment by checkout session
app.post('/api/payments/verify', async (req, res) => {
    if (!stripe)
        return res.status(500).json({ error: 'Stripe is not configured' });
    const { sessionId } = req.body || {};
    if (!sessionId)
        return res.status(400).json({ error: 'Session ID is required' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;
    if (!bookingId)
        return res.status(400).json({ error: 'Booking ID not found in session metadata' });
    if (session.payment_status === 'paid') {
        await prisma.payment.updateMany({
            where: { bookingId },
            data: {
                status: 'COMPLETED',
                stripePaymentIntentId: session.payment_intent || undefined,
            },
        });
        // emit event for other services (booking status update, notifications, analytics)
        await rabbitPublish({
            routingKey: 'payment.paymentcompleted',
            message: {
                type: 'PaymentCompleted',
                bookingId,
                userId: session.metadata?.userId,
                stripePaymentIntentId: session.payment_intent,
                at: new Date().toISOString(),
            },
        });
        return res.json({ success: true, bookingId, paymentIntentId: session.payment_intent });
    }
    return res.status(400).json({ error: 'Payment not completed', bookingId });
});
// Confirm payment (non-stripe/cash flow) - records payment success
app.post('/api/payments/confirm', async (req, res) => {
    const { bookingId, userId, paymentMethod = 'CASH' } = req.body || {};
    if (!bookingId || !userId)
        return res.status(400).json({ error: 'bookingId and userId are required' });
    const status = paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED';
    const payment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
            bookingId,
            userId,
            amount: 0,
            currency: 'vnd',
            status,
            metadata: { paymentMethod },
        },
        update: {
            status,
            metadata: { paymentMethod },
        },
    });
    if (payment.status === 'COMPLETED' || paymentMethod === 'CASH') {
        await rabbitPublish({
            routingKey: 'payment.paymentconfirmed',
            message: {
                type: 'PaymentConfirmed',
                bookingId,
                userId,
                paymentMethod,
                status: payment.status,
                at: new Date().toISOString(),
            },
        });
    }
    return res.json({ success: true, payment });
});
// Refund payment by bookingId (Stripe refund is simplified here)
app.post('/api/payments/refund', async (req, res) => {
    const { bookingId, reason } = req.body || {};
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    await prisma.payment.update({
        where: { bookingId },
        data: { status: 'REFUNDED', metadata: { ...payment.metadata, refundReason: reason || 'requested' } },
    });
    await rabbitPublish({
        routingKey: 'payment.paymentrefunded',
        message: {
            type: 'PaymentRefunded',
            bookingId,
            userId: payment.userId,
            reason: reason || 'requested',
            at: new Date().toISOString(),
        },
    });
    return res.json({ success: true, bookingId });
});
// Stripe webhook endpoint needs raw body. Use express.raw for this route only.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET)
        return res.status(500).send('Stripe webhook not configured');
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string')
        return res.status(400).send('No signature');
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
            await prisma.payment.updateMany({
                where: { bookingId },
                data: {
                    status: 'COMPLETED',
                    stripePaymentIntentId: session.payment_intent || undefined,
                },
            });
            await rabbitPublish({
                routingKey: 'payment.paymentcompleted',
                message: {
                    type: 'PaymentCompleted',
                    bookingId,
                    userId: session.metadata?.userId,
                    stripePaymentIntentId: session.payment_intent,
                    at: new Date().toISOString(),
                },
            });
        }
    }
    res.json({ received: true });
});
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Payment Service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map