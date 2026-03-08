import type { BookingRepository } from '../ports/booking-repository';

/**
 * Check availability for a single roomId (legacy) or multiple roomIds.
 * When roomIds[] is provided, tries each room until one has no conflict.
 * Returns { available, availableRoomId? }.
 */
export async function checkAvailability(deps: {
    bookings: BookingRepository;
    roomId?: string;
    roomIds?: string[];
    checkIn: Date;
    checkOut: Date;
}) {
    const ids = deps.roomIds?.length ? deps.roomIds : deps.roomId ? [deps.roomId] : [];

    for (const id of ids) {
        const conflict = await deps.bookings.findFirstConflict({ roomId: id, checkIn: deps.checkIn, checkOut: deps.checkOut });
        if (!conflict) {
            return { available: true, availableRoomId: id };
        }
    }

    return { available: false, availableRoomId: null };
}
