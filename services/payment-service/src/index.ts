import express from 'express';
import Stripe from 'stripe';
import amqp from 'amqplib';
import { consulRegisterService, rabbitPublish, loadEnvProfile } from '@travel-web/shared';
import { startBookingEventsConsumer } from './lib/booking-events-consumer';
import metricsRegister from './lib/metrics';
import { requireRole, verifyJWT } from '@travel-web/shared';
import prisma, { Prisma } from './lib/prisma';

const PaymentStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUND_REQUESTED: 'REFUND_REQUESTED',
    REFUND_APPROVED: 'REFUND_APPROVED',
    REFUND_REJECTED: 'REFUND_REJECTED',
    REFUNDED: 'REFUNDED',
} as const;

const app = express();
const PORT = process.env.PORT || 3004;

function tryGetPrismaErrorCode(err: unknown): string | undefined {
    if (!err || typeof err !== 'object') return undefined;
    if (!('code' in err)) return undefined;
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
}

function getIdempotencyKey(req: express.Request) {
    const key = req.header('idempotency-key') || req.header('x-idempotency-key');
    return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

async function beginIdempotent(scope: string, key: string, bookingId?: string) {
    try {
        await prisma.idempotencyKey.create({
            data: { scope, key, bookingId: bookingId || null },
        });
        return { ok: true as const };
    } catch (err) {
        // Unique violation -> already seen
        const code = tryGetPrismaErrorCode(err);
        if (code === 'P2002') return { ok: false as const, conflict: true as const };
        throw err;
    }
}

async function getIdempotentResponse(scope: string, key: string) {
    const row = await prisma.idempotencyKey.findUnique({
        where: { scope_key: { scope, key } },
    });
    if (!row || !row.response || !row.statusCode) return null;
    return { statusCode: row.statusCode as number, body: row.response as unknown };
}

async function saveIdempotentResponse(scope: string, key: string, statusCode: number, body: unknown) {
    type ResponseInput = Parameters<typeof prisma.idempotencyKey.update>[0]['data']['response'];
    const response: ResponseInput = body === null ? (Prisma.JsonNull as ResponseInput) : (body as ResponseInput);

    await prisma.idempotencyKey.update({
        where: { scope_key: { scope, key } },
        data: { statusCode, response },
    });
}

function getTimeoutMs() {
    const raw = process.env.HEALTHCHECK_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let timeout: NodeJS.Timeout | null = null;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
            }),
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

async function checkDb() {
    const timeoutMs = getTimeoutMs();
    await withTimeout(prisma.$queryRaw`SELECT 1`, timeoutMs, 'DB check');
}

async function checkRabbitMq() {
    if (process.env.DISABLE_RABBITMQ === 'true') return;

    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL is not set');

    const timeoutMs = getTimeoutMs();
    const conn = await withTimeout(amqp.connect(url), timeoutMs, 'RabbitMQ connect');
    await withTimeout(conn.close(), timeoutMs, 'RabbitMQ close');
}

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

app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
});

// Liveness: DB connectivity (Compose healthcheck can use this or /ready)
app.get('/healthz', async (_req, res) => {
    try {
        await checkDb();
        return res.status(200).json({ ok: true, service: 'payment-service' });
    } catch (err) {
        return res.status(503).json({ ok: false, service: 'payment-service', dependency: 'db', error: (err as Error).message });
    }
});

// Readiness: DB + RabbitMQ connectivity
app.get('/ready', async (_req, res) => {
    try {
        await Promise.all([checkDb(), checkRabbitMq()]);
        return res.status(200).json({ status: 'ready' });
    } catch (err) {
        return res.status(503).json({ status: 'not-ready', error: (err as Error).message });
    }
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

    if (payment.status === PaymentStatus.REFUND_REQUESTED) {
        return res.json({ success: true, bookingId, status: payment.status });
    }

    if (payment.status === PaymentStatus.REFUNDED) {
        return res.status(400).json({ error: 'Payment already refunded' });
    }

    const updated = await prisma.payment.update({
        where: { bookingId },
        data: {
            status: PaymentStatus.REFUND_REQUESTED,
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
app.post('/api/payments/refund-approve', verifyJWT, requireRole('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

    const { bookingId, adminNote } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const existing = await getIdempotentResponse('refund-approve', idemKey);
    if (existing) return res.status(existing.statusCode).json(existing.body);

    const started = await beginIdempotent('refund-approve', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund-approve', idemKey);
        if (maybe) return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Idempotent transition: only execute once.
    const updated = await prisma.payment.updateMany({
        where: {
            bookingId,
            status: { in: [PaymentStatus.REFUND_REQUESTED, PaymentStatus.REFUND_APPROVED] },
        },
        data: {
            status: PaymentStatus.REFUNDED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundApprovedAt: new Date().toISOString(),
                refundAdminNote: adminNote || null,
                refundExecutedAt: new Date().toISOString(),
            },
        },
    });

    const body = updated.count > 0
        ? { success: true, bookingId }
        : { success: true, bookingId, alreadyRefunded: payment.status === PaymentStatus.REFUNDED };

    if (updated.count > 0) {
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
    }

    await saveIdempotentResponse('refund-approve', idemKey, 200, body);
    return res.status(200).json(body);
});

// Admin rejects refund request
app.post('/api/payments/refund-reject', verifyJWT, requireRole('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

    const { bookingId, adminNote } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const existing = await getIdempotentResponse('refund-reject', idemKey);
    if (existing) return res.status(existing.statusCode).json(existing.body);

    const started = await beginIdempotent('refund-reject', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund-reject', idemKey);
        if (maybe) return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const updated = await prisma.payment.updateMany({
        where: {
            bookingId,
            status: PaymentStatus.REFUND_REQUESTED,
        },
        data: {
            status: PaymentStatus.REFUND_REJECTED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundRejectedAt: new Date().toISOString(),
                refundAdminNote: adminNote || null,
            },
        },
    });

    const body = updated.count > 0
        ? { success: true, bookingId, status: 'REFUND_REJECTED' }
        : { success: true, bookingId, status: payment.status };

    if (updated.count > 0) {
        await rabbitPublish({
            routingKey: 'payment.refundrejected',
            message: {
                type: 'RefundRejected',
                bookingId,
                userId: payment.userId,
                at: new Date().toISOString(),
            },
        });
    }

    await saveIdempotentResponse('refund-reject', idemKey, 200, body);
    return res.status(200).json(body);
});

// Refund payment by bookingId (Stripe refund is simplified here)
app.post('/api/payments/refund', verifyJWT, requireRole('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key is required' });

    const { bookingId, reason } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    const existing = await getIdempotentResponse('refund', idemKey);
    if (existing) return res.status(existing.statusCode).json(existing.body);

    const started = await beginIdempotent('refund', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund', idemKey);
        if (maybe) return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const updated = await prisma.payment.updateMany({
        where: {
            bookingId,
            status: { not: PaymentStatus.REFUNDED },
        },
        data: {
            status: PaymentStatus.REFUNDED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? (payment.metadata as Record<string, unknown>)
                    : {}),
                refundReason: reason || 'requested',
                refundExecutedAt: new Date().toISOString(),
            },
        },
    });

    const body = updated.count > 0
        ? { success: true, bookingId }
        : { success: true, bookingId, alreadyRefunded: true };

    if (updated.count > 0) {
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
    }

    await saveIdempotentResponse('refund', idemKey, 200, body);
    return res.status(200).json(body);
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

    startBookingEventsConsumer().catch((err) => console.error('Booking events consumer failed to start', err));

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
