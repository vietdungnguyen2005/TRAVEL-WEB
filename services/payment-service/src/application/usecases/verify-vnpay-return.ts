import type { EventMessage } from '@travel-web/contracts';
import type { VnpayGateway } from '../ports/vnpay-gateway';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';

export async function verifyVnpayReturn(deps: {
    vnpay: VnpayGateway;
    payments: PaymentRepository;
    publisher: EventPublisher;
    params: Record<string, string>;
}) {
    const result = deps.vnpay.verifyReturnParams(deps.params);

    if (!result.isValid) {
        return { ok: false as const, error: 'Invalid secure hash' };
    }

    if (!result.bookingId) {
        return { ok: false as const, error: 'Booking ID not found in response' };
    }

    if (result.responseCode !== '00') {
        return { ok: false as const, bookingId: result.bookingId, error: `Payment not successful (code: ${result.responseCode})` };
    }

    await deps.payments.markCompletedByBookingId({
        bookingId: result.bookingId,
        vnpTransactionNo: result.vnpTransactionNo || undefined,
    });

    const event: EventMessage<'PaymentCompleted', { bookingId: string; vnpTransactionNo?: string }> = {
        id: `payment.completed:${result.bookingId}:${result.vnpTransactionNo || ''}`,
        type: 'PaymentCompleted',
        source: 'payment-service',
        occurredAt: new Date().toISOString(),
        version: 1,
        correlationId: result.bookingId,
        data: {
            bookingId: result.bookingId,
            vnpTransactionNo: result.vnpTransactionNo || undefined,
        },
    };

    await deps.publisher.publish('payment.completed', event, {
        messageId: event.id,
        correlationId: result.bookingId,
    });

    return { ok: true as const, bookingId: result.bookingId, vnpTransactionNo: result.vnpTransactionNo };
}
