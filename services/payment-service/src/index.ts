import express from 'express';
import Stripe from 'stripe';
import prisma from './lib/prisma';
import { consulRegisterService, rabbitPublish } from '@travel-web/shared';
import { loadEnvProfile } from '../../../infra/scripts/load-env-profile';
// NOTE: Prisma client enum types won't include new enum variants until after `prisma generate`.
// We keep runtime values as strings here; CI/build should run after regeneration/migrate.
type PaymentStatusString =
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUND_REQUESTED'
    | 'REFUND_APPROVED'
    | 'REFUND_REJECTED'
    | 'REFUNDED';

const app = express();
const PORT = process.env.PORT || 3004;

// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
loadEnvProfile({ cwd: process.cwd().split('/services/')[0] });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, {
        // Keep this pinned to the API version configured in Stripe.
        apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
    })
    : null;

// JSON routes
app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'payment-service' });
});

// Create checkout session
app.post('/api/payments/create-checkout', async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured' });
    const { bookingId, userId, email, amount, currency = 'vnd' } = req.body || {};
    if (!bookingId || !email || !amount) {
        return res.status(400).json({ error: 'bookingId, email, amount are required' });
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
            userId: String(userId || 'unknown'),
            amount: Number(amount),
            currency,
            status: 'PENDING',
            stripeCheckoutSessionId: checkoutSession.id,
            metadata: { bookingId, userId },
        },
        update: {
            userId: String(userId || 'unknown'),
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
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured' });
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return res.status(400).json({ error: 'Booking ID not found in session metadata' });

    if (session.payment_status === 'paid') {
        await prisma.payment.updateMany({
            where: { bookingId },
            data: {
                status: 'COMPLETED',
                stripePaymentIntentId: (session.payment_intent as string) || undefined,
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
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    // In gateway-first mode, the gateway can inject userId from JWT.
    // Allow the client to omit it.
    const resolvedUserId = userId ? String(userId) : 'unknown';

    const status = paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED';
    const payment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
            bookingId,
            userId: resolvedUserId,
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
                userId: resolvedUserId,
                paymentMethod,
                status: payment.status,
                at: new Date().toISOString(),
            },
        });
    }

    return res.json({ success: true, payment });
});

// User requests a refund (requires admin approval)
app.post('/api/payments/refund-request', async (req, res) => {
    const { bookingId, reason } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status === ('REFUND_REQUESTED' as PaymentStatusString)) {
        return res.json({ success: true, bookingId, status: payment.status });
    }

    if (payment.status === ('REFUNDED' as PaymentStatusString)) {
        return res.status(400).json({ error: 'Payment already refunded' });
    }

    const updated = await prisma.payment.update({
        where: { bookingId },
        data: {
            status: 'REFUND_REQUESTED' as any,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundRequestReason: reason || 'requested',
                refundRequestedAt: new Date().toISOString(),
            },
        },
    });

    await rabbitPublish({
        routingKey: 'payment.refundrequested',
        message: {
            type: 'RefundRequested',
            bookingId,
            userId: updated.userId,
            reason: reason || 'requested',
            at: new Date().toISOString(),
        },
    });

    return res.json({ success: true, bookingId, status: updated.status });
});

// Admin approves refund, then we execute refund and emit PaymentRefunded
app.post('/api/payments/refund-approve', async (req, res) => {
    const { bookingId, adminNote } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status !== ('REFUND_REQUESTED' as PaymentStatusString)) {
        return res.status(400).json({ error: `Refund is not in requested state (current=${payment.status})` });
    }

    await prisma.payment.update({
        where: { bookingId },
        data: {
            status: 'REFUND_APPROVED' as any,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundApprovedAt: new Date().toISOString(),
                refundAdminNote: adminNote || null,
            },
        },
    });

    // Execute the refund (simplified: just mark as REFUNDED)
    await prisma.payment.update({
        where: { bookingId },
        data: {
            status: 'REFUNDED' as any,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundExecutedAt: new Date().toISOString(),
            },
        },
    });

    await rabbitPublish({
        routingKey: 'payment.paymentrefunded',
        message: {
            type: 'PaymentRefunded',
            bookingId,
            userId: payment.userId,
            reason: 'approved',
            at: new Date().toISOString(),
        },
    });

    return res.json({ success: true, bookingId });
});

// Admin rejects refund request
app.post('/api/payments/refund-reject', async (req, res) => {
    const { bookingId, adminNote } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status !== ('REFUND_REQUESTED' as PaymentStatusString)) {
        return res.status(400).json({ error: `Refund is not in requested state (current=${payment.status})` });
    }

    const updated = await prisma.payment.update({
        where: { bookingId },
        data: {
            status: 'REFUND_REJECTED' as any,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundRejectedAt: new Date().toISOString(),
                refundAdminNote: adminNote || null,
            },
        },
    });

    await rabbitPublish({
        routingKey: 'payment.refundrejected',
        message: {
            type: 'RefundRejected',
            bookingId,
            userId: updated.userId,
            at: new Date().toISOString(),
        },
    });

    return res.json({ success: true, bookingId, status: updated.status });
});

// Refund payment by bookingId (Stripe refund is simplified here)
app.post('/api/payments/refund', async (req, res) => {
    const { bookingId, reason } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await prisma.payment.update({
        where: { bookingId },
        data: {
            status: 'REFUNDED',
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundReason: reason || 'requested',
            },
        },
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
    if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(500).send('Stripe webhook not configured');

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') return res.status(400).send('No signature');

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).send(`Webhook Error: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
            await prisma.payment.updateMany({
                where: { bookingId },
                data: {
                    status: 'COMPLETED',
                    stripePaymentIntentId: (session.payment_intent as string) || undefined,
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
    console.log(`Payment Service running on port ${PORT}`);

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
