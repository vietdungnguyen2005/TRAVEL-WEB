import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository, CreateBookingInput } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';
import type { Booking, BookingStatus } from '../../domain/booking';

export type CreateBookingDeps = {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
};

export type CreateBookingParams = {
    userId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    totalPrice: number;
    status?: BookingStatus;
    holdExpiresAt?: Date | null;
};

/**
 * Create a booking atomically:
 *   1. Acquire row-level lock on conflicting bookings (FOR UPDATE)
 *   2. Check availability inside the locked scope
 *   3. Create the booking
 *   4. Write outbox event for downstream services
 *
 * All steps run within a single DB transaction,
 * preventing race conditions when concurrent users book the same room.
 */
export async function createBooking(
    deps: CreateBookingDeps,
    params: CreateBookingParams,
): Promise<Booking> {
    const {
        userId,
        roomId,
        checkIn,
        checkOut,
        numberOfGuests,
        totalPrice,
        status = 'ON_HOLD',
        holdExpiresAt,
    } = params;

    return deps.uow.transaction(async (tx) => {
        // ── 1. Conflict check WITH row-level lock (FOR UPDATE) ──
        // This ensures that concurrent transactions wait here,
        // so only one can create a booking for overlapping dates.
        const conflict = await deps.bookings.findFirstConflictTx(tx, {
            roomId,
            checkIn,
            checkOut,
        });

        if (conflict) {
            const err = new Error(
                `Room ${roomId} is already booked for the selected dates ` +
                `(conflicting booking: ${conflict.id}, status: ${conflict.status})`,
            );
            (err as any).statusCode = 409;
            (err as any).code = 'BOOKING_CONFLICT';
            throw err;
        }

        // ── 2. Create booking ──
        const input: CreateBookingInput = {
            userId,
            roomId,
            checkIn,
            checkOut,
            numberOfGuests,
            totalPrice,
            status,
            holdExpiresAt: holdExpiresAt ?? null,
        };

        const booking = await deps.bookings.create(tx, input);

        // ── 3. Outbox event (same transaction = guaranteed delivery) ──
        const eventPayload: EventMessage = {
            id: crypto.randomUUID(),
            type: 'booking.created',
            source: 'booking-service',
            occurredAt: new Date().toISOString(),
            version: 1,
            correlationId: booking.id,
            data: {
                bookingId: booking.id,
                userId: booking.userId,
                roomId: booking.roomId,
                checkIn: booking.checkIn.toISOString(),
                checkOut: booking.checkOut.toISOString(),
                numberOfGuests: booking.numberOfGuests,
                totalPrice: String(booking.totalPrice),
                status: booking.status,
            },
        };

        await deps.outbox.create(tx, {
            id: crypto.randomUUID(),
            aggregateType: 'Booking',
            aggregateId: booking.id,
            eventType: 'booking.created',
            payload: eventPayload,
        });

        return booking;
    });
}
