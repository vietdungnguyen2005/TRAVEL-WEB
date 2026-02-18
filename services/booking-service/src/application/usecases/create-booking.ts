import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingRepository, CreateBookingInput } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function createBooking(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
    input: Omit<CreateBookingInput, 'status'>;
}) {
    return deps.uow.transaction(async (tx) => {
        const booking = await deps.bookings.create(tx, {
            ...deps.input,
            status: 'PENDING',
        });

        const outboxId = crypto.randomUUID();
        const payload: EventMessage<'BookingCreated'> = {
            id: outboxId,
            type: 'BookingCreated',
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
            },
        };

        await deps.outbox.create(tx, {
            id: outboxId,
            aggregateType: 'booking',
            aggregateId: booking.id,
            eventType: 'created',
            payload,
        });

        return booking;
    });
}
