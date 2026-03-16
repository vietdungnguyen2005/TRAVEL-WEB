import type { BookingRepository } from '../ports/booking-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function applyPaymentRefundEvent(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    bookingId: string;
    outcome: 'REFUNDED' | 'REFUND_FAILED' | 'REFUND_REQUESTED' | 'REFUND_REJECTED';
}) {
    return deps.uow.transaction(async (tx) => {
        return deps.bookings.updatePaymentStatus(tx, {
            id: deps.bookingId,
            paymentStatus: deps.outcome,
        });
    });
}
