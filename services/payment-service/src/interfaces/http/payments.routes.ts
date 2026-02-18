import express from 'express';
import type Stripe from 'stripe';
import { requireRole, verifyJWT } from '@travel-web/shared';

import { createPrismaPaymentRepository } from '../../infrastructure/prisma/prisma-payment-repository';
import { createPrismaIdempotencyStore } from '../../infrastructure/prisma/prisma-idempotency-store';
import { createRabbitEventPublisher } from '../../infrastructure/rabbitmq/rabbit-event-publisher';
import { createStripeGateway } from '../../infrastructure/stripe/stripe-gateway';

import { createCheckout } from '../../application/usecases/create-checkout';
import { verifyCheckout } from '../../application/usecases/verify-checkout';
import { confirmPayment } from '../../application/usecases/confirm-payment';
import { refundRequest } from '../../application/usecases/refund-request';
import { refundApprove, getIdempotencyKeyFromHeaders } from '../../application/usecases/refund-approve';
import { refundReject } from '../../application/usecases/refund-reject';
import { refundDirect } from '../../application/usecases/refund-direct';
import { handleWebhookCheckoutSessionCompleted } from '../../application/usecases/handle-webhook-checkout-session-completed';

export function createPaymentsRouter(deps: {
    stripe: Stripe | null;
    stripeWebhookSecret?: string;
}) {
    const router = express.Router();

    const paymentsRepo = createPrismaPaymentRepository();
    const idem = createPrismaIdempotencyStore();
    const publisher = createRabbitEventPublisher();
    const stripeGateway = createStripeGateway(deps.stripe);

    router.post('/create-checkout', async (req, res, next) => {
        try {
            const { bookingId, userId, email, amount, currency = 'vnd' } = req.body || {};
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            const result = await createCheckout({
                stripe: stripeGateway,
                payments: paymentsRepo,
                input: {
                    bookingId,
                    userId,
                    email,
                    amount: Number(amount),
                    currency,
                    appUrl,
                },
            });
            return res.json(result);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/verify', async (req, res, next) => {
        try {
            const { sessionId } = req.body || {};
            const result = await verifyCheckout({
                stripe: stripeGateway,
                payments: paymentsRepo,
                publisher,
                sessionId: String(sessionId || ''),
            });

            if (!result.ok) return res.status(400).json({ error: result.error, bookingId: result.bookingId });
            return res.json({ success: true, bookingId: result.bookingId, paymentIntentId: result.paymentIntentId });
        } catch (err) {
            return next(err);
        }
    });

    router.post('/confirm', async (req, res, next) => {
        try {
            const { bookingId, userId, paymentMethod = 'CASH' } = req.body || {};
            const result = await confirmPayment({
                payments: paymentsRepo,
                publisher,
                input: { bookingId, userId, paymentMethod },
            });

            return res.json(result);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/refund-request', async (req, res, next) => {
        try {
            const { bookingId, reason } = req.body || {};
            const result = await refundRequest({
                payments: paymentsRepo,
                publisher,
                input: { bookingId, reason },
            });
            return res.status(result.status).json(result.body);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/refund-approve', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
        try {
            const idemKey = getIdempotencyKeyFromHeaders({
                'idempotency-key': req.header('idempotency-key'),
                'x-idempotency-key': req.header('x-idempotency-key'),
            });
            if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

            const { bookingId, adminNote } = req.body || {};
            if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

            const result = await refundApprove({
                idempotency: idem,
                payments: paymentsRepo,
                publisher,
                idemKey,
                bookingId,
                adminNote,
            });

            return res.status(result.status).json(result.body);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/refund-reject', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
        try {
            const idemKey = getIdempotencyKeyFromHeaders({
                'idempotency-key': req.header('idempotency-key'),
                'x-idempotency-key': req.header('x-idempotency-key'),
            });
            if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

            const { bookingId, adminNote } = req.body || {};
            if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

            const result = await refundReject({
                idempotency: idem,
                payments: paymentsRepo,
                publisher,
                idemKey,
                bookingId,
                adminNote,
            });

            return res.status(result.status).json(result.body);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/refund', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
        try {
            const idemKey = getIdempotencyKeyFromHeaders({
                'idempotency-key': req.header('idempotency-key'),
                'x-idempotency-key': req.header('x-idempotency-key'),
            });
            if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

            const { bookingId, reason } = req.body || {};
            if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

            const result = await refundDirect({
                idempotency: idem,
                payments: paymentsRepo,
                publisher,
                idemKey,
                bookingId,
                reason,
            });

            return res.status(result.status).json(result.body);
        } catch (err) {
            return next(err);
        }
    });

    // Stripe webhook must use raw body. This route assumes the app-level JSON middleware is skipped for this path.
    router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
        try {
            if (!deps.stripe || !deps.stripeWebhookSecret) return res.status(500).send('Stripe webhook not configured');

            const signature = req.headers['stripe-signature'];
            if (!signature || typeof signature !== 'string') return res.status(400).send('No signature');

            let event: Stripe.Event;
            try {
                event = deps.stripe.webhooks.constructEvent(req.body, signature, deps.stripeWebhookSecret);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                return res.status(400).send(`Webhook Error: ${message}`);
            }

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object as Stripe.Checkout.Session;
                const result = await handleWebhookCheckoutSessionCompleted({
                    idempotency: idem,
                    payments: paymentsRepo,
                    publisher,
                    stripeEventId: event.id,
                    session,
                });
                return res.status(result.status).json(result.body);
            }

            return res.json({ received: true });
        } catch (err) {
            return next(err);
        }
    });

    return router;
}
