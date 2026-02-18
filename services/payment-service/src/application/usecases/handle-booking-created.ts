import type { EventMessage } from '@travel-web/contracts';
import type { PaymentRepository } from '../ports/payment-repository';
import type { EventPublisher } from '../ports/event-publisher';

export async function handleBookingCreated(deps: {
    payments: PaymentRepository;
    publisher: EventPublisher;
    input: { bookingId: string; userId: string; roomId: string };
    causationId?: string;
    sourceRoutingKey?: string;
}) {
    await deps.payments.upsertDemoCompleted({
        bookingId: deps.input.bookingId,
        userId: deps.input.userId,
        roomId: deps.input.roomId,
    });

    const outEventId = `payment.completed:${deps.input.bookingId}`;
    const event: EventMessage<'PaymentCompleted', { bookingId: string; userId: string }> = {
        id: outEventId,
        type: 'PaymentCompleted',
        source: 'payment-service',
        occurredAt: new Date().toISOString(),
        version: 1,
        correlationId: deps.input.bookingId,
        causationId: deps.causationId,
        data: {
            bookingId: deps.input.bookingId,
            userId: deps.input.userId,
        },
    };

    await deps.publisher.publish('payment.completed', event, {
        messageId: outEventId,
        correlationId: deps.input.bookingId,
        headers: {
            'x-causation-id': deps.causationId,
            'x-source-routing-key': deps.sourceRoutingKey,
        },
    });
}
