import express from 'express';
import { requireRole, verifyJWT } from '@travel-web/shared';

import { createPrismaPaymentRepository } from '../../infrastructure/prisma/prisma-payment-repository';
import { createPrismaIdempotencyStore } from '../../infrastructure/prisma/prisma-idempotency-store';
import { createRabbitEventPublisher } from '../../infrastructure/rabbitmq/rabbit-event-publisher';
import { createVnpayGateway } from '../../infrastructure/vnpay/vnpay-gateway';

import { createPaymentUrl } from '../../application/usecases/create-payment-url';
import { verifyVnpayReturn } from '../../application/usecases/verify-vnpay-return';
import { handleVnpayIpn } from '../../application/usecases/handle-vnpay-ipn';
import { confirmPayment } from '../../application/usecases/confirm-payment';
import { refundRequest } from '../../application/usecases/refund-request';
import { refundApprove, getIdempotencyKeyFromHeaders } from '../../application/usecases/refund-approve';
import { refundReject } from '../../application/usecases/refund-reject';
import { refundDirect } from '../../application/usecases/refund-direct';

export function createPaymentsRouter() {
    const router = express.Router();

    const paymentsRepo = createPrismaPaymentRepository();
    const idem = createPrismaIdempotencyStore();
    const publisher = createRabbitEventPublisher();
    const vnpayGateway = createVnpayGateway();

    // Create VNPay payment URL
    router.post('/create-payment-url', async (req, res, next) => {
        try {
            const { bookingId, userId, amount, currency = 'vnd' } = req.body || {};
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                || req.socket.remoteAddress
                || '127.0.0.1';

            const result = await createPaymentUrl({
                vnpay: vnpayGateway,
                payments: paymentsRepo,
                input: {
                    bookingId,
                    userId,
                    amount: Number(amount),
                    appUrl,
                    ipAddress,
                },
            });
            return res.json(result);
        } catch (err) {
            return next(err);
        }
    });

    // VNPay return URL handler (frontend calls this after redirect back)
    router.post('/vnpay-return', async (req, res, next) => {
        try {
            const params = req.body || {};
            const result = await verifyVnpayReturn({
                vnpay: vnpayGateway,
                payments: paymentsRepo,
                publisher,
                params,
            });
            if (!result.ok) return res.status(400).json({ error: result.error, bookingId: result.bookingId });
            return res.json({ success: true, bookingId: result.bookingId, vnpTransactionNo: result.vnpTransactionNo });
        } catch (err) {
            return next(err);
        }
    });

    // VNPay IPN callback (server-to-server from VNPay, NO auth required)
    router.get('/vnpay-ipn', async (req, res, next) => {
        try {
            const params = req.query as Record<string, string>;
            const result = await handleVnpayIpn({
                vnpay: vnpayGateway,
                idempotency: idem,
                payments: paymentsRepo,
                publisher,
                params,
            });
            return res.json(result);
        } catch (err) {
            return next(err);
        }
    });

    // Cash payment confirmation (unchanged)
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

    return router;
}
