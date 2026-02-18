import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function confirmBookingFromPaymentCompleted(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
    bookingId: string;
}) {
    return deps.uow.transaction(async (tx) => {
        const updated = await deps.bookings.updateStatus(tx, {
            id: deps.bookingId,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
        });

        const outboxId = crypto.randomUUID();
        const confirmed: EventMessage<'BookingConfirmed', {
            bookingId: string;
            userId: string;
            roomId: string;
            status: string;
            paymentStatus?: string | null;
        }> = {
            id: outboxId,
            type: 'BookingConfirmed',
            source: 'booking-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: updated.id,
            data: {
                bookingId: updated.id,
                userId: updated.userId,
                roomId: updated.roomId,
                status: updated.status,
                paymentStatus: updated.paymentStatus,
            },
        };

        await deps.outbox.create(tx, {
            id: outboxId,
            aggregateType: 'booking',
            aggregateId: updated.id,
            eventType: 'confirmed',
            payload: confirmed,
        });

        return updated;
    });
}
