import type { BookingRepository } from '../ports/booking-repository';
import type { BookingStatus } from '../../domain/booking';

export async function listBookings(deps: { bookings: BookingRepository; userId?: string; status?: BookingStatus }) {
    return deps.bookings.findManyAll({ userId: deps.userId, status: deps.status });
}
