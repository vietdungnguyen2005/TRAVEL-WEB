"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const amqplib_1 = __importDefault(require("amqplib"));
const shared_1 = require("@travel-web/shared");
const booking_events_consumer_1 = require("./lib/booking-events-consumer");
const metrics_1 = __importDefault(require("./lib/metrics"));
const shared_2 = require("@travel-web/shared");
const prisma_1 = __importStar(require("./lib/prisma"));
const PaymentStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUND_REQUESTED: 'REFUND_REQUESTED',
    REFUND_APPROVED: 'REFUND_APPROVED',
    REFUND_REJECTED: 'REFUND_REJECTED',
    REFUNDED: 'REFUNDED',
};
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
function tryGetPrismaErrorCode(err) {
    if (!err || typeof err !== 'object')
        return undefined;
    if (!('code' in err))
        return undefined;
    const code = err.code;
    return typeof code === 'string' ? code : undefined;
}
function getIdempotencyKey(req) {
    const key = req.header('idempotency-key') || req.header('x-idempotency-key');
    return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}
async function beginIdempotent(scope, key, bookingId) {
    try {
        await prisma_1.default.idempotencyKey.create({
            data: { scope, key, bookingId: bookingId || null },
        });
        return { ok: true };
    }
    catch (err) {
        // Unique violation -> already seen
        const code = tryGetPrismaErrorCode(err);
        if (code === 'P2002')
            return { ok: false, conflict: true };
        throw err;
    }
}
async function getIdempotentResponse(scope, key) {
    const row = await prisma_1.default.idempotencyKey.findUnique({
        where: { scope_key: { scope, key } },
    });
    if (!row || !row.response || !row.statusCode)
        return null;
    return { statusCode: row.statusCode, body: row.response };
}
async function saveIdempotentResponse(scope, key, statusCode, body) {
    const response = body === null ? prisma_1.Prisma.JsonNull : body;
    await prisma_1.default.idempotencyKey.update({
        where: { scope_key: { scope, key } },
        data: { statusCode, response },
    });
}
function getTimeoutMs() {
    const raw = process.env.HEALTHCHECK_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : 2000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}
async function withTimeout(promise, timeoutMs, label) {
    let timeout = null;
    try {
        return await Promise.race([
            promise,
            new Promise((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
            }),
        ]);
    }
    finally {
        if (timeout)
            clearTimeout(timeout);
    }
}
async function checkDb() {
    const timeoutMs = getTimeoutMs();
    await withTimeout(prisma_1.default.$queryRaw `SELECT 1`, timeoutMs, 'DB check');
}
async function checkRabbitMq() {
    if (process.env.DISABLE_RABBITMQ === 'true')
        return;
    const url = process.env.RABBITMQ_URL;
    if (!url)
        throw new Error('RABBITMQ_URL is not set');
    const timeoutMs = getTimeoutMs();
    const conn = await withTimeout(amqplib_1.default.connect(url), timeoutMs, 'RabbitMQ connect');
    await withTimeout(conn.close(), timeoutMs, 'RabbitMQ close');
}
// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
(0, shared_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = STRIPE_SECRET_KEY
    ? new stripe_1.default(STRIPE_SECRET_KEY, {
        // Keep this pinned to the API version configured in Stripe.
        apiVersion: '2025-12-15.clover',
    })
    : null;
// JSON routes
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'payment-service' });
});
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metrics_1.default.contentType);
    res.end(await metrics_1.default.metrics());
});
// Liveness: DB connectivity (Compose healthcheck can use this or /ready)
app.get('/healthz', async (_req, res) => {
    try {
        await checkDb();
        return res.status(200).json({ ok: true, service: 'payment-service' });
    }
    catch (err) {
        return res.status(503).json({ ok: false, service: 'payment-service', dependency: 'db', error: err.message });
    }
});
// Readiness: DB + RabbitMQ connectivity
app.get('/ready', async (_req, res) => {
    try {
        await Promise.all([checkDb(), checkRabbitMq()]);
        return res.status(200).json({ status: 'ready' });
    }
    catch (err) {
        return res.status(503).json({ status: 'not-ready', error: err.message });
    }
});
// Create checkout session
app.post('/api/payments/create-checkout', async (req, res) => {
    if (!stripe)
        return res.status(500).json({ error: 'Stripe is not configured' });
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
    await prisma_1.default.payment.upsert({
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
        await prisma_1.default.payment.updateMany({
            where: { bookingId },
            data: {
                status: 'COMPLETED',
                stripePaymentIntentId: session.payment_intent || undefined,
            },
        });
        // emit event for other services (booking status update, notifications, analytics)
        await (0, shared_1.rabbitPublish)({
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
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    // In gateway-first mode, the gateway can inject userId from JWT.
    // Allow the client to omit it.
    const resolvedUserId = userId ? String(userId) : 'unknown';
    const status = paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED';
    const payment = await prisma_1.default.payment.upsert({
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
        await (0, shared_1.rabbitPublish)({
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
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    const payment = await prisma_1.default.payment.findUnique({ where: { bookingId } });
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    if (payment.status === PaymentStatus.REFUND_REQUESTED) {
        return res.json({ success: true, bookingId, status: payment.status });
    }
    if (payment.status === PaymentStatus.REFUNDED) {
        return res.status(400).json({ error: 'Payment already refunded' });
    }
    const updated = await prisma_1.default.payment.update({
        where: { bookingId },
        data: {
            status: PaymentStatus.REFUND_REQUESTED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? payment.metadata
                    : {}),
                refundRequestReason: reason || 'requested',
                refundRequestedAt: new Date().toISOString(),
            },
        },
    });
    await (0, shared_1.rabbitPublish)({
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
app.post('/api/payments/refund-approve', shared_2.verifyJWT, (0, shared_2.requireRole)('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey)
        return res.status(400).json({ error: 'Idempotency-Key is required' });
    const { bookingId, adminNote } = req.body || {};
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    const existing = await getIdempotentResponse('refund-approve', idemKey);
    if (existing)
        return res.status(existing.statusCode).json(existing.body);
    const started = await beginIdempotent('refund-approve', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund-approve', idemKey);
        if (maybe)
            return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }
    const payment = await prisma_1.default.payment.findUnique({ where: { bookingId } });
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    // Idempotent transition: only execute once.
    const updated = await prisma_1.default.payment.updateMany({
        where: {
            bookingId,
            status: { in: [PaymentStatus.REFUND_REQUESTED, PaymentStatus.REFUND_APPROVED] },
        },
        data: {
            status: PaymentStatus.REFUNDED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? payment.metadata
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
        await (0, shared_1.rabbitPublish)({
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
app.post('/api/payments/refund-reject', shared_2.verifyJWT, (0, shared_2.requireRole)('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey)
        return res.status(400).json({ error: 'Idempotency-Key is required' });
    const { bookingId, adminNote } = req.body || {};
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    const existing = await getIdempotentResponse('refund-reject', idemKey);
    if (existing)
        return res.status(existing.statusCode).json(existing.body);
    const started = await beginIdempotent('refund-reject', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund-reject', idemKey);
        if (maybe)
            return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }
    const payment = await prisma_1.default.payment.findUnique({ where: { bookingId } });
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    const updated = await prisma_1.default.payment.updateMany({
        where: {
            bookingId,
            status: PaymentStatus.REFUND_REQUESTED,
        },
        data: {
            status: PaymentStatus.REFUND_REJECTED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? payment.metadata
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
        await (0, shared_1.rabbitPublish)({
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
app.post('/api/payments/refund', shared_2.verifyJWT, (0, shared_2.requireRole)('ADMIN'), async (req, res) => {
    const idemKey = getIdempotencyKey(req);
    if (!idemKey)
        return res.status(400).json({ error: 'Idempotency-Key is required' });
    const { bookingId, reason } = req.body || {};
    if (!bookingId)
        return res.status(400).json({ error: 'bookingId is required' });
    const existing = await getIdempotentResponse('refund', idemKey);
    if (existing)
        return res.status(existing.statusCode).json(existing.body);
    const started = await beginIdempotent('refund', idemKey, bookingId);
    if (!started.ok) {
        const maybe = await getIdempotentResponse('refund', idemKey);
        if (maybe)
            return res.status(maybe.statusCode).json(maybe.body);
        return res.status(409).json({ error: 'Idempotency key is already in progress' });
    }
    const payment = await prisma_1.default.payment.findUnique({ where: { bookingId } });
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    const updated = await prisma_1.default.payment.updateMany({
        where: {
            bookingId,
            status: { not: PaymentStatus.REFUNDED },
        },
        data: {
            status: PaymentStatus.REFUNDED,
            metadata: {
                ...(typeof payment.metadata === 'object' && payment.metadata
                    ? payment.metadata
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
        await (0, shared_1.rabbitPublish)({
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
app.post('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
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
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).send(`Webhook Error: ${message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
            await prisma_1.default.payment.updateMany({
                where: { bookingId },
                data: {
                    status: 'COMPLETED',
                    stripePaymentIntentId: session.payment_intent || undefined,
                },
            });
            await (0, shared_1.rabbitPublish)({
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
    (0, booking_events_consumer_1.startBookingEventsConsumer)().catch((err) => console.error('Booking events consumer failed to start', err));
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'paymentService',
            port: Number(PORT),
            healthCheckPath: '/healthz',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map