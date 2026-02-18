import express from 'express';
import { rateLimitFixedWindow, redisGetJson, redisSetJson, requireRole, tryGetUserFromRequest, verifyJWT } from '@travel-web/shared';
import { bookingCreateCounter, bookingLifecycleDurationSeconds } from '../../lib/metrics';
import { BOOKING_STATUSES, type BookingStatus } from '../../domain/booking';
import { prismaUnitOfWork } from '../../infrastructure/prisma/prisma-unit-of-work';
import { createPrismaBookingRepository } from '../../infrastructure/prisma/prisma-booking-repository';
import { createPrismaOutboxRepository } from '../../infrastructure/prisma/prisma-outbox-repository';
import { listBookings } from '../../application/usecases/list-bookings';
import { createBooking } from '../../application/usecases/create-booking';
import { holdBooking } from '../../application/usecases/hold-booking';
import { checkAvailability } from '../../application/usecases/check-availability';
import { updateAdminBookingStatus } from '../../application/usecases/update-admin-booking-status';
import { cancelBooking } from '../../application/usecases/cancel-booking';

export const bookingRouter = express.Router();

const bookingsRepo = createPrismaBookingRepository();
const outboxRepo = createPrismaOutboxRepository();

function getNumberEnv(name: string, defaultValue: number) {
    const raw = process.env[name];
    const parsed = raw ? Number(raw) : defaultValue;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function getRateLimitIdentity(req: express.Request, userId?: string) {
    if (userId) return `user:${userId}`;
    const ip = (req.ip || '').trim();
    return ip ? `ip:${ip}` : 'ip:unknown';
}

function getUserIdFromRequest(req: express.Request): string | undefined {
    const user = tryGetUserFromRequest(req);
    return typeof user?.id === 'string' ? user.id : undefined;
}

function allowUserIdFromQueryOrBody() {
    // Default: allow for local/dev compatibility.
    // In production, disable to avoid privilege escalation.
    if (process.env.ALLOW_USER_ID_FALLBACK === 'true') return true;
    return process.env.NODE_ENV !== 'production';
}

// My bookings (used by web dashboard)
bookingRouter.get('/my-bookings', async (req, res, next) => {
    try {
        const tokenUserId = getUserIdFromRequest(req);
        const queryUserId = allowUserIdFromQueryOrBody() && typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const userId = tokenUserId || queryUserId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const bookings = await bookingsRepo.findManyByUserId(userId);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// List bookings (admin only; optionally filter by userId)
bookingRouter.get('/', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const bookings = await listBookings({ bookings: bookingsRepo, userId });
        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// Admin list bookings (supports ?status=PENDING)
bookingRouter.get('/admin/bookings', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const statusRaw = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
        const status = statusRaw && BOOKING_STATUSES.includes(statusRaw as BookingStatus)
            ? (statusRaw as BookingStatus)
            : undefined;

        const bookings = await listBookings({ bookings: bookingsRepo, status });
        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// Admin update status (used by admin UI)
bookingRouter.patch('/admin/bookings/:id/status', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
    const { id } = req.params;
    const status = (req.body?.status as string | undefined)?.toUpperCase();
    try {
        if (!status) return res.status(400).json({ message: 'status is required' });

        const allowed = new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
        if (!allowed.has(status)) {
            return res.status(400).json({ message: 'invalid status' });
        }

        const updated = await updateAdminBookingStatus({
            uow: prismaUnitOfWork,
            bookings: bookingsRepo,
            outbox: outboxRepo,
            bookingId: id,
            status: status as BookingStatus,
        });

        res.json({ success: true, booking: updated });
    } catch (err) {
        next(err);
    }
});

// Create booking — writes booking and outbox in same transaction
bookingRouter.post('/', async (req, res, next) => {
    const { userId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    try {
        const windowSeconds = getNumberEnv('BOOKING_RATE_LIMIT_WINDOW_SECONDS', 60);
        const max = getNumberEnv('BOOKING_CREATE_RATE_LIMIT_MAX', 10);
        const identity = getRateLimitIdentity(req, typeof userId === 'string' ? userId : undefined);
        const rl = await rateLimitFixedWindow({
            key: `rl:booking:create:${identity}`,
            limit: max,
            windowSeconds,
        });

        res.setHeader('x-rate-limit-limit', String(max));
        res.setHeader('x-rate-limit-remaining', String(rl.remaining));
        res.setHeader('x-rate-limit-reset', String(rl.resetSeconds));
        if (!rl.allowed) {
            return res.status(429).json({ error: 'Too Many Requests' });
        }

        const result = await createBooking({
            uow: prismaUnitOfWork,
            bookings: bookingsRepo,
            outbox: outboxRepo,
            input: {
                userId,
                roomId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                numberOfGuests: Number(numberOfGuests || 1),
                totalPrice,
            },
        });

        res.status(201).json(result);
        try {
            bookingCreateCounter.inc({ status: 'pending' }, 1);
        } catch {
            // ignore
        }
    } catch (err) {
        next(err);
    }
});

// Hold booking (creates ON_HOLD for 15 mins)
bookingRouter.post('/hold', async (req, res, next) => {
    const tokenUserId = getUserIdFromRequest(req);
    const { userId: bodyUserId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    const userId = tokenUserId || (allowUserIdFromQueryOrBody() ? bodyUserId : undefined);

    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const windowSeconds = getNumberEnv('BOOKING_RATE_LIMIT_WINDOW_SECONDS', 60);
        const max = getNumberEnv('BOOKING_HOLD_RATE_LIMIT_MAX', 20);
        const identity = getRateLimitIdentity(req, userId);
        const rl = await rateLimitFixedWindow({
            key: `rl:booking:hold:${identity}`,
            limit: max,
            windowSeconds,
        });

        res.setHeader('x-rate-limit-limit', String(max));
        res.setHeader('x-rate-limit-remaining', String(rl.remaining));
        res.setHeader('x-rate-limit-reset', String(rl.resetSeconds));
        if (!rl.allowed) {
            return res.status(429).json({ error: 'Too Many Requests' });
        }

        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);

        const result = await holdBooking({
            uow: prismaUnitOfWork,
            bookings: bookingsRepo,
            outbox: outboxRepo,
            holdExpiresAt,
            input: {
                userId,
                roomId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                numberOfGuests: Number(numberOfGuests || 1),
                totalPrice,
            },
        });

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

// Simple availability check (conflict detection against CONFIRMED/ON_HOLD)
bookingRouter.post('/check-availability', async (req, res, next) => {
    const { roomId, checkIn, checkOut } = req.body;
    try {
        const ttlSeconds = getNumberEnv('AVAILABILITY_CACHE_TTL_SECONDS', 15);
        const key = `cache:booking:availability:${String(roomId)}:${String(checkIn)}:${String(checkOut)}`;

        const cached = await redisGetJson<{ available: boolean }>(key);
        if (cached && typeof cached.available === 'boolean') {
            res.setHeader('x-cache', 'HIT');
            return res.json(cached);
        }

        const result = await checkAvailability({
            bookings: bookingsRepo,
            roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
        });

        try {
            await redisSetJson(key, result, ttlSeconds);
        } catch {
            // ignore cache write errors
        }

        res.setHeader('x-cache', 'MISS');

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Cancel booking: set CANCELLED + outbox
bookingRouter.post('/:id/cancel', async (req, res, next) => {
    const { id } = req.params;
    try {
        const updated = await cancelBooking({
            uow: prismaUnitOfWork,
            bookings: bookingsRepo,
            outbox: outboxRepo,
            bookingId: id,
        });

        const createdAt = updated.createdAt instanceof Date ? updated.createdAt.getTime() : undefined;
        if (typeof createdAt === 'number') {
            const seconds = (Date.now() - createdAt) / 1000;
            if (Number.isFinite(seconds) && seconds >= 0) {
                bookingLifecycleDurationSeconds.observe({ transition: 'created_to_cancelled' }, seconds);
            }
        }

        res.json({ success: true, booking: updated });
    } catch (err) {
        next(err);
    }
});
