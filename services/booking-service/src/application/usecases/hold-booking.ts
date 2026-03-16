import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository, CreateBookingInput } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';
import { AppError } from '@travel-web/shared';

export type HoldBookingDeps = {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
};

export type HoldBookingParams = Omit<CreateBookingInput, 'status' | 'holdExpiresAt'> & {
    holdExpiresAt: Date;
};

/**
 * Hold a room for 15 minutes.
 *
 * Conflict check (FOR UPDATE row-lock) + insert both run inside
 * a serializable transaction so two concurrent holds on the same
 * room / dates cannot both succeed.
 */
export async function holdBooking(
    deps: HoldBookingDeps,
    params: HoldBookingParams,
) {
    return deps.uow.transaction(async (tx) => {
        // ── Conflict check inside tx (row-locked) ──
        const conflict = await deps.bookings.findFirstConflictTx(tx, {
            roomId: params.roomId,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
        });
        if (conflict) {
            throw new AppError(409, 'Room is not available for the selected dates', 'BOOKING_CONFLICT');
        }

        const booking = await deps.bookings.create(tx, {
            ...params,
            status: 'ON_HOLD',
            holdExpiresAt: params.holdExpiresAt,
        });

        const outboxId = crypto.randomUUID();
        const payload: EventMessage<'BookingHeld'> = {
            id: outboxId,
            type: 'BookingHeld',
            source: 'booking-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: booking.id,
            data: {
                bookingId: booking.id,
                userId: booking.userId,
                roomId: booking.roomId,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalPrice,
                status: booking.status,
                holdExpiresAt: booking.holdExpiresAt,
            },
        };

        await deps.outbox.create(tx, {
            id: outboxId,
            aggregateType: 'booking',
            aggregateId: booking.id,
            eventType: 'held',
            payload,
        });

        return booking;
    });
}
