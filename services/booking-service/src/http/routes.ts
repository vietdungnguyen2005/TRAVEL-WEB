import express from 'express';
import prisma from '../lib/prisma';
import { bookingCreateCounter } from '../lib/metrics';
import jwt from 'jsonwebtoken';

export const bookingRouter = express.Router();

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return secret;
}

function getUserIdFromRequest(req: express.Request): string | undefined {
    // Support both Authorization: Bearer <token> and cookie access_token.
    const auth = req.headers.authorization;
    const bearer = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : undefined;

    const cookieHeader = req.headers.cookie;
    const cookieToken = cookieHeader
        ?.split(';')
        .map((s) => s.trim())
        .find((c) => c.startsWith('access_token='))
        ?.split('=')
        .slice(1)
        .join('=');

    const token = bearer || cookieToken;
    if (!token) return undefined;

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload | string;
        if (typeof decoded === 'string') return undefined;
        return typeof decoded.sub === 'string' ? decoded.sub : undefined;
    } catch {
        return undefined;
    }
}

// My bookings (used by web dashboard)
bookingRouter.get('/my-bookings', async (req, res, next) => {
    try {
        const tokenUserId = getUserIdFromRequest(req);
        const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const userId = tokenUserId || queryUserId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const bookings = await prisma.booking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// List bookings (simple; optionally filter by userId)
bookingRouter.get('/', async (req, res, next) => {
    try {
        const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const bookings = await prisma.booking.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

// Create booking — writes booking and outbox in same transaction
bookingRouter.post('/', async (req, res, next) => {
    const { userId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    try {
        const result = await prisma.$transaction(async (tx: unknown) => {
            const typedTx = tx as typeof prisma;
            const booking = await typedTx.booking.create({
                data: {
                    userId,
                    roomId,
                    checkIn: new Date(checkIn),
                    checkOut: new Date(checkOut),
                    numberOfGuests: Number(numberOfGuests || 1),
                    totalPrice,
                    status: 'PENDING'
                }
            });

            await typedTx.outbox.create({
                data: {
                    aggregateType: 'Booking',
                    aggregateId: booking.id,
                    eventType: 'BookingCreated',
                    payload: {
                        id: booking.id,
                        userId: booking.userId,
                        roomId: booking.roomId,
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                        totalPrice: booking.totalPrice,
                        status: booking.status
                    }
                }
            });

            return booking;
        });

        res.status(201).json(result);
        try {
            bookingCreateCounter.inc({ status: 'pending' }, 1);
        } catch (e) {
            // metrics increment should not fail request
        }
    } catch (err) {
        next(err);
    }
});

// Hold booking (creates ON_HOLD for 15 mins)
bookingRouter.post('/hold', async (req, res, next) => {
    const tokenUserId = getUserIdFromRequest(req);
    const { userId: bodyUserId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    const userId = bodyUserId || tokenUserId;
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);

        const result = await prisma.$transaction(async (tx: unknown) => {
            const typedTx = tx as typeof prisma;
            const booking = await typedTx.booking.create({
                data: {
                    userId,
                    roomId,
                    checkIn: new Date(checkIn),
                    checkOut: new Date(checkOut),
                    numberOfGuests: Number(numberOfGuests || 1),
                    totalPrice,
                    status: 'ON_HOLD',
                    holdExpiresAt,
                }
            });

            await typedTx.outbox.create({
                data: {
                    aggregateType: 'Booking',
                    aggregateId: booking.id,
                    eventType: 'BookingHeld',
                    payload: {
                        id: booking.id,
                        userId: booking.userId,
                        roomId: booking.roomId,
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                        totalPrice: booking.totalPrice,
                        status: booking.status,
                        holdExpiresAt: booking.holdExpiresAt,
                    }
                }
            });

            return booking;
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
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const conflict = await prisma.booking.findFirst({
            where: {
                roomId,
                status: { in: ['CONFIRMED', 'ON_HOLD'] },
                OR: [
                    { checkIn: { gte: checkInDate, lt: checkOutDate } },
                    { checkOut: { gt: checkInDate, lte: checkOutDate } },
                    { AND: [{ checkIn: { lte: checkInDate } }, { checkOut: { gte: checkOutDate } }] },
                ],
            },
        });

        res.json({ available: !conflict });
    } catch (err) {
        next(err);
    }
});

// Cancel booking (basic): set CANCELLED
bookingRouter.post('/:id/cancel', async (req, res, next) => {
    const { id } = req.params;
    try {
        const updated = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        await prisma.outbox.create({
            data: {
                aggregateType: 'Booking',
                aggregateId: updated.id,
                eventType: 'BookingCancelled',
                payload: {
                    id: updated.id,
                    status: updated.status,
                },
            },
        });

        res.json({ success: true, booking: updated });
    } catch (err) {
        next(err);
    }
});
