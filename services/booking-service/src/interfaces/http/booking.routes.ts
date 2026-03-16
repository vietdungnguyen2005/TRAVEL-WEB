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
import { getUnavailableDates } from '../../application/usecases/get-unavailable-dates';

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
    // 1. Try JWT verification (token in Authorization/cookie)
    const user = tryGetUserFromRequest(req);
    if (typeof user?.id === 'string') return user.id;
    // 2. Fallback: gateway already verified JWT and forwarded x-user-id header
    const headerUserId = req.headers['x-user-id'];
    if (typeof headerUserId === 'string' && headerUserId.length > 0) return headerUserId;
    return undefined;
}

function allowUserIdFromQueryOrBody() {
    // Default: allow for local/dev compatibility.
    // In production, disable to avoid privilege escalation.
    if (process.env.ALLOW_USER_ID_FALLBACK === 'true') return true;
    return process.env.NODE_ENV !== 'production';
}

/**
 * Fetch the pricePerNight and maxGuests for a physical room by querying the room schema.
 * Returns the per-night price and max guests, or null if the room is not found.
 */
async function getRoomInfo(roomId: string): Promise<{ pricePerNight: number; maxGuests: number } | null> {
    try {
        const prisma = (await import('../../lib/prisma')).default;
        const rows = await prisma.$queryRawUnsafe<{ basePrice: number; maxGuests: number }[]>(
            `SELECT rt."basePrice", rt."maxGuests"
             FROM room."Room" r
             JOIN room."RoomType" rt ON r."roomTypeId" = rt.id
             WHERE r.id = $1
             LIMIT 1`,
            roomId,
        );
        if (rows.length === 0) return null;
        return { pricePerNight: Number(rows[0].basePrice), maxGuests: Number(rows[0].maxGuests) };
    } catch {
        return null;
    }
}

// Public: get unavailable dates for a set of physical room IDs
// No auth required — used by calendar on room detail page
bookingRouter.post('/unavailable-dates', async (req, res, next) => {
    try {
        const { roomIds } = req.body ?? {};
        if (!Array.isArray(roomIds) || roomIds.length === 0) {
            return res.json({ data: [] });
        }
        const dates = await getUnavailableDates({ bookings: bookingsRepo, roomIds });
        res.json({ data: dates });
    } catch (err) {
        next(err);
    }
});

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

        // Enrich with real payment status from payment schema
        const bookingIds = bookings.map((b) => b.id);
        if (bookingIds.length > 0) {
            try {
                const prisma = (await import('../../lib/prisma')).default;
                const payments = await prisma.$queryRawUnsafe<{ bookingId: string; status: string }[]>(
                    `SELECT "bookingId", status::text FROM payment."Payment" WHERE "bookingId" = ANY($1::text[])`,
                    bookingIds,
                );
                const paymentMap = new Map(payments.map((p) => [p.bookingId, p.status]));
                for (const b of bookings) {
                    const realStatus = paymentMap.get(b.id);
                    if (realStatus) {
                        (b as any).paymentStatus = realStatus;
                    }
                }
            } catch {
                // Payment enrichment failed — continue with cached values
            }
        }

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

        // Enrich with user info and real payment status from shared DB schemas
        const prisma = (await import('../../lib/prisma')).default;
        const userIds = [...new Set(bookings.map((b) => b.userId))];
        const roomIds = [...new Set(bookings.map((b) => b.roomId))];
        const bookingIds = bookings.map((b) => b.id);

        // Cross-schema queries (all schemas in same Supabase DB)
        let users: { id: string; name: string | null; email: string; phone: string | null }[] = [];
        const [rooms, payments] = await Promise.all([
            roomIds.length > 0
                ? prisma.$queryRawUnsafe<{ id: string; roomNumber: string; roomTypeName: string }[]>(
                    `SELECT r.id, r."roomNumber", rt.name AS "roomTypeName"
                     FROM room."Room" r JOIN room."RoomType" rt ON r."roomTypeId" = rt.id
                     WHERE r.id = ANY($1::text[])`,
                    roomIds,
                ).catch(() => [] as { id: string; roomNumber: string; roomTypeName: string }[])
                : [],
            bookingIds.length > 0
                ? prisma.$queryRawUnsafe<{ bookingId: string; status: string }[]>(
                    `SELECT "bookingId", status::text FROM payment."Payment" WHERE "bookingId" = ANY($1::text[])`,
                    bookingIds,
                ).catch(() => [] as { bookingId: string; status: string }[])
                : [],
        ]);

        // Try cross-schema query first; fallback to auth-service HTTP call
        if (userIds.length > 0) {
            users = await prisma.$queryRawUnsafe<typeof users>(
                `SELECT id, name, email, phone FROM app_auth."User" WHERE id = ANY($1::text[])`,
                userIds,
            ).catch(async (err: Error) => {
                console.warn('[admin/bookings] Cross-schema user query failed, falling back to auth-service:', err.message);
                // Fallback: call auth-service /api/admin/users endpoint
                try {
                    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
                    const token = req.headers.authorization;
                    const resp = await fetch(`${authUrl}/api/admin/users`, {
                        headers: token ? { Authorization: token } : {},
                    });
                    if (resp.ok) {
                        const allUsers: { id: string; name: string | null; email: string; phone: string | null }[] = await resp.json();
                        const idSet = new Set(userIds);
                        return allUsers.filter((u) => idSet.has(u.id));
                    }
                } catch { /* ignore fallback error */ }
                return [] as typeof users;
            });
        }

        const userMap = new Map(users.map((u) => [u.id, u]));
        const roomMap = new Map(rooms.map((r) => [r.id, r]));
        const paymentMap = new Map(payments.map((p) => [p.bookingId, p.status]));

        const enriched = bookings.map((b) => {
            const u = userMap.get(b.userId);
            const r = roomMap.get(b.roomId);
            // Use real payment status if available, else fall back to booking's cached value
            const realPaymentStatus = paymentMap.get(b.id) || b.paymentStatus;
            return {
                ...b,
                paymentStatus: realPaymentStatus,
                user: u ? { name: u.name, email: u.email, phone: u.phone } : undefined,
                room: r ? { roomNumber: r.roomNumber, roomType: { name: r.roomTypeName } } : undefined,
            };
        });

        res.json(enriched);
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

        const allowed = new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'ON_HOLD']);
        if (!allowed.has(status)) {
            return res.status(400).json({ message: 'invalid status' });
        }

        // Validate status transitions
        const existing = await bookingsRepo.getById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const validTransitions: Record<string, string[]> = {
            PENDING: ['ON_HOLD', 'CONFIRMED', 'CANCELLED'],
            ON_HOLD: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
            COMPLETED: [],  // terminal state
            CANCELLED: [],  // terminal state
        };
        const allowedNext = validTransitions[existing.status] || [];
        if (!allowedNext.includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from ${existing.status} to ${status}. Allowed: ${allowedNext.join(', ') || 'none (terminal state)'}`,
            });
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

// Get single booking by ID (used by payment page)
// MUST be after all fixed GET routes to avoid matching /my-bookings, /admin/bookings, etc.
bookingRouter.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await bookingsRepo.getById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow owner or admin to view
        const tokenUserId = getUserIdFromRequest(req);
        const tokenRole = (req as any).user?.role ?? req.headers['x-user-role'];
        if (!tokenUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (tokenUserId !== booking.userId && tokenRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(booking);
    } catch (err) {
        next(err);
    }
});

// Create booking — writes booking and outbox in same transaction
bookingRouter.post('/', async (req, res, next) => {
    const { roomId, checkIn, checkOut, numberOfGuests } = req.body;
    // Prefer authenticated user ID from JWT (x-user-id header set by gateway), fall back to body
    const userId = getUserIdFromRequest(req) || req.body.userId;
    try {
        // Input validation
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'checkIn and checkOut must be valid dates' });
        }
        if (checkInDate < now) {
            return res.status(400).json({ message: 'checkIn cannot be in the past' });
        }
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'checkOut must be after checkIn' });
        }
        if (!numberOfGuests || Number(numberOfGuests) < 1) {
            return res.status(400).json({ message: 'numberOfGuests must be at least 1' });
        }
        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({ message: 'roomId is required' });
        }

        // Server-side price calculation — never trust client totalPrice
        const roomInfo = await getRoomInfo(roomId);
        if (roomInfo == null || roomInfo.pricePerNight <= 0) {
            return res.status(400).json({ message: 'Room not found or room has no valid price' });
        }

        // Validate guest capacity
        const guestCount = Number(numberOfGuests);
        if (guestCount > roomInfo.maxGuests) {
            return res.status(400).json({ message: `numberOfGuests (${guestCount}) exceeds room capacity (${roomInfo.maxGuests})` });
        }

        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = roomInfo.pricePerNight * nights;

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

        // Conflict check is now inside the transaction (with FOR UPDATE lock)
        // to prevent race conditions when concurrent users book the same room.
        // Default status is ON_HOLD — set holdExpiresAt so holds auto-expire
        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);

        const result = await createBooking(
            {
                uow: prismaUnitOfWork,
                bookings: bookingsRepo,
                outbox: outboxRepo,
            },
            {
                userId,
                roomId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                numberOfGuests: Number(numberOfGuests || 1),
                totalPrice,
                holdExpiresAt,
            },
        );

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
    const { userId: bodyUserId, roomId, checkIn, checkOut, numberOfGuests } = req.body;
    const userId = tokenUserId || (allowUserIdFromQueryOrBody() ? bodyUserId : undefined);

    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Input validation
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'checkIn and checkOut must be valid dates' });
        }
        if (checkInDate < now) {
            return res.status(400).json({ message: 'checkIn cannot be in the past' });
        }
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'checkOut must be after checkIn' });
        }
        if (!numberOfGuests || Number(numberOfGuests) < 1) {
            return res.status(400).json({ message: 'numberOfGuests must be at least 1' });
        }
        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({ message: 'roomId is required' });
        }

        // Server-side price calculation — never trust client totalPrice
        const roomInfo = await getRoomInfo(roomId);
        if (roomInfo == null || roomInfo.pricePerNight <= 0) {
            return res.status(400).json({ message: 'Room not found or room has no valid price' });
        }

        // Validate guest capacity
        const guestCount = Number(numberOfGuests);
        if (guestCount > roomInfo.maxGuests) {
            return res.status(400).json({ message: `numberOfGuests (${guestCount}) exceeds room capacity (${roomInfo.maxGuests})` });
        }

        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = roomInfo.pricePerNight * nights;

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

        // Conflict check now runs inside the transaction (with FOR UPDATE lock)
        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);

        const result = await holdBooking(
            {
                uow: prismaUnitOfWork,
                bookings: bookingsRepo,
                outbox: outboxRepo,
            },
            {
                userId,
                roomId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                numberOfGuests: Number(numberOfGuests || 1),
                totalPrice,
                holdExpiresAt,
            },
        );

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

// Simple availability check (conflict detection against CONFIRMED/ON_HOLD)
// Accepts roomId (single) or roomIds[] (tries each until one is free)
bookingRouter.post('/check-availability', async (req, res, next) => {
    const { roomId, roomIds, checkIn, checkOut } = req.body;
    try {
        // ── Validation ──
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'checkIn and checkOut are required' });
        }
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (checkInDate < now) {
            return res.status(400).json({ message: 'checkIn cannot be in the past' });
        }
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'checkOut must be after checkIn' });
        }
        if (!roomId && (!Array.isArray(roomIds) || roomIds.length === 0)) {
            return res.status(400).json({ message: 'roomId or roomIds is required' });
        }

        const ids: string[] = Array.isArray(roomIds) && roomIds.length > 0 ? roomIds : roomId ? [roomId] : [];
        const cacheKey = `cache:booking:availability:${ids.sort().join(',')}:${String(checkIn)}:${String(checkOut)}`;
        const ttlSeconds = getNumberEnv('AVAILABILITY_CACHE_TTL_SECONDS', 15);

        const cached = await redisGetJson<{ available: boolean; availableRoomId: string | null }>(cacheKey);
        if (cached && typeof cached.available === 'boolean') {
            res.setHeader('x-cache', 'HIT');
            return res.json(cached);
        }

        const result = await checkAvailability({
            bookings: bookingsRepo,
            roomIds: ids,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
        });

        try {
            await redisSetJson(cacheKey, result, ttlSeconds);
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
        // Ownership check: only the booking owner or an ADMIN can cancel
        const tokenUserId = getUserIdFromRequest(req);
        const tokenRole = (req as any).user?.role ?? req.headers['x-user-role'];
        if (!tokenUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const existing = await bookingsRepo.getById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (tokenUserId !== existing.userId && tokenRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: you can only cancel your own bookings' });
        }

        // Prevent cancelling bookings that are already CANCELLED or COMPLETED
        if (existing.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }
        if (existing.status === 'COMPLETED') {
            return res.status(400).json({ message: 'Cannot cancel a completed booking' });
        }

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
