import type { BookingRepository } from '../ports/booking-repository';

/**
 * Returns a list of booked date ranges for the given physical room IDs.
 * Used by the frontend to disable unavailable dates on the calendar.
 */
export async function getUnavailableDates(deps: {
    bookings: BookingRepository;
    roomIds: string[];
}) {
    const activeBookings = await deps.bookings.findActiveBookingsForRooms(deps.roomIds);

    // Group bookings per room
    const roomBookingsMap = new Map<string, { checkIn: Date; checkOut: Date }[]>();
    for (const b of activeBookings) {
        let list = roomBookingsMap.get(b.roomId);
        if (!list) {
            list = [];
            roomBookingsMap.set(b.roomId, list);
        }
        list.push({ checkIn: b.checkIn, checkOut: b.checkOut });
    }

    const totalRooms = deps.roomIds.length;
    if (totalRooms === 0) return [];

    // Collect all unique date boundaries
    const events: { date: number; type: 'start' | 'end' }[] = [];
    for (const b of activeBookings) {
        events.push({ date: b.checkIn.getTime(), type: 'start' });
        events.push({ date: b.checkOut.getTime(), type: 'end' });
    }
    events.sort((a, b) => a.date - b.date || (a.type === 'end' ? -1 : 1));

    // Sweep-line: find date ranges where ALL rooms are booked
    const unavailable: { checkIn: string; checkOut: string }[] = [];

    // For each date, count how many rooms are booked
    // A date is "unavailable" if every room has at least one booking covering it
    // Simpler approach: for each date, count rooms that have a booking overlapping that date
    // Since we're dealing with ranges, use a day-by-day approach for the next 365 days
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 365);

    const unavailableDates: string[] = [];
    const dayMs = 86400000;

    for (let d = now.getTime(); d < maxDate.getTime(); d += dayMs) {
        const date = new Date(d);
        // Count how many rooms have a booking covering this date
        let bookedRooms = 0;
        for (const roomId of deps.roomIds) {
            const bookings = roomBookingsMap.get(roomId) ?? [];
            const isBooked = bookings.some(
                (b) => b.checkIn.getTime() <= d && b.checkOut.getTime() > d,
            );
            if (isBooked) bookedRooms++;
        }
        if (bookedRooms >= totalRooms) {
            unavailableDates.push(date.toISOString().slice(0, 10));
        }
    }

    return unavailableDates;
}
