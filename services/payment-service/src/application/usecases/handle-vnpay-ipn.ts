import type { EventMessage } from '@travel-web/contracts';
import type { VnpayGateway } from '../ports/vnpay-gateway';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';
import type { IdempotencyStore } from '../ports/idempotency-store';

export async function handleVnpayIpn(deps: {
    vnpay: VnpayGateway;
    idempotency: IdempotencyStore;
    payments: PaymentRepository;
    publisher: EventPublisher;
    params: Record<string, string>;
}) {
    const result = deps.vnpay.verifyIpnParams(deps.params);

    if (!result.isValid) {
        return { RspCode: '97', Message: 'Invalid checksum' };
    }

    if (!result.bookingId) {
        return { RspCode: '01', Message: 'Order not found' };
    }

    const idemKey = `${result.vnpTxnRef || ''}:${result.vnpTransactionNo || ''}`;

    const existing = await deps.idempotency.getResponse('vnpay-ipn', idemKey);
    if (existing) return existing.body as { RspCode: string; Message: string };

    const started = await deps.idempotency.begin('vnpay-ipn', idemKey, result.bookingId);
    if (!started.ok) {
        const maybe = await deps.idempotency.getResponse('vnpay-ipn', idemKey);
        if (maybe) return maybe.body as { RspCode: string; Message: string };
        return { RspCode: '00', Message: 'Confirm Success' };
    }

    const payment = await deps.payments.findByBookingId(result.bookingId);
    if (!payment) {
        const body = { RspCode: '01', Message: 'Order not found' };
        await deps.idempotency.saveResponse('vnpay-ipn', idemKey, 200, body);
        return body;
    }

    if (payment.status === 'COMPLETED') {
        const body = { RspCode: '02', Message: 'Order already confirmed' };
        await deps.idempotency.saveResponse('vnpay-ipn', idemKey, 200, body);
        return body;
    }

    if (result.responseCode !== '00') {
        await deps.payments.updateStatusByBookingId({
            bookingId: result.bookingId,
            status: 'FAILED',
            mergeMetadata: { vnpResponseCode: result.responseCode },
        });
        const body = { RspCode: '00', Message: 'Confirm Success' };
        await deps.idempotency.saveResponse('vnpay-ipn', idemKey, 200, body);
        return body;
    }

    await deps.payments.markCompletedByBookingId({
        bookingId: result.bookingId,
        vnpTransactionNo: result.vnpTransactionNo || undefined,
    });

    const event: EventMessage<'PaymentCompleted', { bookingId: string; userId?: string; vnpTransactionNo?: string }> = {
        id: `payment.completed:${result.bookingId}:${result.vnpTransactionNo || ''}`,
        type: 'PaymentCompleted',
        source: 'payment-service',
        occurredAt: new Date().toISOString(),
        version: 1,
        correlationId: result.bookingId,
        data: {
            bookingId: result.bookingId,
            userId: payment.userId,
            vnpTransactionNo: result.vnpTransactionNo || undefined,
        },
    };

    await deps.publisher.publish('payment.completed', event, {
        messageId: event.id,
        correlationId: result.bookingId,
    });

    const body = { RspCode: '00', Message: 'Confirm Success' };
    await deps.idempotency.saveResponse('vnpay-ipn', idemKey, 200, body);
    return body;
}
