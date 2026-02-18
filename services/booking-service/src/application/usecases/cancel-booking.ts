import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function cancelBooking(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
    bookingId: string;
}) {
    return deps.uow.transaction(async (tx) => {
        const updated = await deps.bookings.updateStatus(tx, { id: deps.bookingId, status: 'CANCELLED' });

        const now = new Date().toISOString();
        const outboxId = crypto.randomUUID();

        const payload: EventMessage<'BookingCancelled', {
            bookingId: string;
            userId: string;
            roomId: string;
            status: string;
            paymentStatus?: string | null;
        }> = {
            id: outboxId,
            type: 'BookingCancelled',
            source: 'booking-service',
            occurredAt: now,
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
            eventType: 'cancelled',
            payload,
        });

        return updated;
    });
}
