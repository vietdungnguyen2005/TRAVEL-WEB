import { Logger } from '@travel-web/shared';
import { prismaUnitOfWork } from '../infrastructure/prisma/prisma-unit-of-work';
import { createPrismaBookingRepository } from '../infrastructure/prisma/prisma-booking-repository';
import { createPrismaOutboxRepository } from '../infrastructure/prisma/prisma-outbox-repository';
import { cancelBooking } from '../application/usecases/cancel-booking';

const log = new Logger('expire-holds');

const INTERVAL_MS = 60_000; // check every minute

let timer: ReturnType<typeof setInterval> | null = null;

async function expireHolds() {
    const bookings = createPrismaBookingRepository();
    const expired = await bookings.findExpiredOnHold(new Date());

    if (expired.length === 0) return;

    log.info('Expiring ON_HOLD bookings', { count: expired.length });

    for (const booking of expired) {
        try {
            await cancelBooking({
                uow: prismaUnitOfWork,
                bookings,
                outbox: createPrismaOutboxRepository(),
                bookingId: booking.id,
            });
            log.info('Expired ON_HOLD booking cancelled', { bookingId: booking.id });
        } catch (err) {
            log.error('Failed to cancel expired booking', { bookingId: booking.id }, err as Error);
        }
    }
}

export function startExpireHoldsScheduler() {
    log.info('Starting expire-holds scheduler', { intervalMs: INTERVAL_MS });
    // Run once immediately, then on interval
    expireHolds().catch((err) => log.error('expire-holds initial run failed', err as Error));
    timer = setInterval(() => {
        expireHolds().catch((err) => log.error('expire-holds tick failed', err as Error));
    }, INTERVAL_MS);
}

export function stopExpireHoldsScheduler() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        log.info('Stopped expire-holds scheduler');
    }
}
