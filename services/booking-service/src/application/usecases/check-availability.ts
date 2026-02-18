import type { BookingRepository } from '../ports/booking-repository';

export async function checkAvailability(deps: {
    bookings: BookingRepository;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
}) {
    const conflict = await deps.bookings.findFirstConflict({ roomId: deps.roomId, checkIn: deps.checkIn, checkOut: deps.checkOut });
    return { available: !conflict };
}
