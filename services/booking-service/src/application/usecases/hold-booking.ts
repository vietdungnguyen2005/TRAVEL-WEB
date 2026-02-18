import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository, CreateBookingInput } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function holdBooking(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
    input: Omit<CreateBookingInput, 'status'>;
    holdExpiresAt: Date;
}) {
    return deps.uow.transaction(async (tx) => {
        const booking = await deps.bookings.create(tx, {
            ...deps.input,
            status: 'ON_HOLD',
            holdExpiresAt: deps.holdExpiresAt,
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
