"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const metrics_1 = require("../lib/metrics");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.bookingRouter = express_1.default.Router();
function requireAdmin(req, res, next) {
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
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (typeof decoded === 'string')
            return res.status(401).json({ message: 'Unauthorized' });
        const role = decoded.role;
        if (role !== 'ADMIN')
            return res.status(403).json({ message: 'Forbidden' });
        req.user = { id: decoded.sub, role };
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function getUserIdFromRequest(req) {
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
    if (!token)
        return undefined;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (typeof decoded === 'string')
            return undefined;
        return typeof decoded.sub === 'string' ? decoded.sub : undefined;
    }
    catch {
        return undefined;
    }
}
// My bookings (used by web dashboard)
exports.bookingRouter.get('/my-bookings', async (req, res, next) => {
    try {
        const tokenUserId = getUserIdFromRequest(req);
        const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const userId = tokenUserId || queryUserId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const bookings = await prisma_1.default.booking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (err) {
        next(err);
    }
});
// List bookings (simple; optionally filter by userId)
exports.bookingRouter.get('/', async (req, res, next) => {
    try {
        const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const bookings = await prisma_1.default.booking.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (err) {
        next(err);
    }
});
// =============================
// Admin booking approval flow
// =============================
// Admin list bookings (supports ?status=PENDING)
exports.bookingRouter.get('/admin/bookings', requireAdmin, async (req, res, next) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const bookings = await prisma_1.default.booking.findMany({
            where: status ? { status: status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (err) {
        next(err);
    }
});
// Admin update status (used by admin UI)
exports.bookingRouter.patch('/admin/bookings/:id/status', requireAdmin, async (req, res, next) => {
    const { id } = req.params;
    const status = req.body?.status?.toUpperCase();
    try {
        if (!status)
            return res.status(400).json({ message: 'status is required' });
        const allowed = new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
        if (!allowed.has(status)) {
            return res.status(400).json({ message: 'invalid status' });
        }
        const updated = await prisma_1.default.booking.update({
            where: { id },
            data: {
                status: status,
                ...(status === 'CONFIRMED' ? { paymentStatus: 'PENDING' } : null),
            },
        });
        await prisma_1.default.outbox.create({
            data: {
                aggregateType: 'Booking',
                aggregateId: updated.id,
                eventType: 'BookingStatusUpdated',
                payload: {
                    id: updated.id,
                    userId: updated.userId,
                    roomId: updated.roomId,
                    status: updated.status,
                    paymentStatus: updated.paymentStatus,
                },
            },
        });
        // If admin approved, emit the same event name other services might already listen for.
        if (status === 'CONFIRMED') {
            await prisma_1.default.outbox.create({
                data: {
                    aggregateType: 'Booking',
                    aggregateId: updated.id,
                    eventType: 'BookingConfirmed',
                    payload: {
                        id: updated.id,
                        userId: updated.userId,
                        roomId: updated.roomId,
                        status: updated.status,
                        paymentStatus: updated.paymentStatus,
                    },
                },
            });
        }
        res.json({ success: true, booking: updated });
    }
    catch (err) {
        next(err);
    }
});
// Create booking — writes booking and outbox in same transaction
exports.bookingRouter.post('/', async (req, res, next) => {
    const { userId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    try {
        const result = await prisma_1.default.$transaction(async (tx) => {
            const typedTx = tx;
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
            metrics_1.bookingCreateCounter.inc({ status: 'pending' }, 1);
        }
        catch (e) {
            // metrics increment should not fail request
        }
    }
    catch (err) {
        next(err);
    }
});
// Hold booking (creates ON_HOLD for 15 mins)
exports.bookingRouter.post('/hold', async (req, res, next) => {
    const tokenUserId = getUserIdFromRequest(req);
    const { userId: bodyUserId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    const userId = bodyUserId || tokenUserId;
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);
        const result = await prisma_1.default.$transaction(async (tx) => {
            const typedTx = tx;
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
    }
    catch (err) {
        next(err);
    }
});
// Simple availability check (conflict detection against CONFIRMED/ON_HOLD)
exports.bookingRouter.post('/check-availability', async (req, res, next) => {
    const { roomId, checkIn, checkOut } = req.body;
    try {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const conflict = await prisma_1.default.booking.findFirst({
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
    }
    catch (err) {
        next(err);
    }
});
// Cancel booking (basic): set CANCELLED
exports.bookingRouter.post('/:id/cancel', async (req, res, next) => {
    const { id } = req.params;
    try {
        const updated = await prisma_1.default.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        await prisma_1.default.outbox.create({
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
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=routes.js.map