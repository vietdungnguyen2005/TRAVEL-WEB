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
        // Fetch current booking to validate status before confirming
        const existing = await deps.bookings.getById(deps.bookingId);
        if (!existing) throw new Error(`Booking ${deps.bookingId} not found`);

        // Only PENDING or ON_HOLD can be confirmed
        if (existing.status !== 'PENDING' && existing.status !== 'ON_HOLD') {
            throw new Error(`Cannot confirm booking in ${existing.status} status`);
        }

        // Check for room conflicts to prevent double-confirmation
        const conflict = await deps.bookings.findFirstConflict({
            roomId: existing.roomId,
            checkIn: new Date(existing.checkIn),
            checkOut: new Date(existing.checkOut),
            excludeBookingId: deps.bookingId,
        });
        if (conflict) {
            throw new Error(`Room conflict: another booking (${conflict.id}) already exists for these dates`);
        }

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
