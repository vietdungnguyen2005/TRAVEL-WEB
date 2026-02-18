import type { EventMessage } from '@travel-web/contracts';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';
import type { PaymentStatus } from '../../domain/payment';

export async function confirmPayment(deps: {
    payments: PaymentRepository;
    publisher: EventPublisher;
    input: { bookingId: string; userId?: string; paymentMethod?: string };
}) {
    const { bookingId, userId, paymentMethod = 'CASH' } = deps.input;
    if (!bookingId) throw new Error('bookingId is required');

    const resolvedUserId = userId ? String(userId) : 'unknown';

    const status: PaymentStatus = paymentMethod === 'CASH' ? 'PENDING' : 'COMPLETED';

    // Keep behavior: upsert record (simplified via updateStatusByBookingId; create if missing)
    const existing = await deps.payments.findByBookingId(bookingId);
    if (!existing) {
        // Create minimal payment row via checkout upsert (reusing helper), then set desired status.
        await deps.payments.upsertCheckoutSession({
            bookingId,
            userId: resolvedUserId,
            amount: 0,
            currency: 'vnd',
            stripeCheckoutSessionId: 'manual',
            metadata: { paymentMethod },
        });
    }

    await deps.payments.updateStatusByBookingId({
        bookingId,
        status,
        mergeMetadata: { paymentMethod },
    });

    const payment = await deps.payments.findByBookingId(bookingId);

    if (payment && (payment.status === 'COMPLETED' || paymentMethod === 'CASH')) {
        const event: EventMessage<'PaymentCompleted', { bookingId: string; userId: string; paymentMethod?: string; status?: string }> = {
            id: `payment.completed:${bookingId}:${payment.id}`,
            type: 'PaymentCompleted',
            source: 'payment-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: bookingId,
            data: {
                bookingId,
                userId: resolvedUserId,
                paymentMethod,
                status: payment.status,
            },
        };

        await deps.publisher.publish('payment.completed', event, {
            messageId: event.id,
            correlationId: bookingId,
        });
    }

    return { success: true, payment };
}
