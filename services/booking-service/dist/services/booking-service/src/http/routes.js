"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const metrics_1 = require("../lib/metrics");
exports.bookingRouter = express_1.default.Router();
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
// Create booking — writes booking and outbox in same transaction
exports.bookingRouter.post('/', async (req, res, next) => {
    const { userId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    try {
        const result = await prisma_1.default.$transaction(async (tx) => {
            const booking = await tx.booking.create({
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
            await tx.outbox.create({
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
    const { userId, roomId, checkIn, checkOut, totalPrice, numberOfGuests } = req.body;
    try {
        const holdExpiresAt = new Date();
        holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);
        const result = await prisma_1.default.$transaction(async (tx) => {
            const booking = await tx.booking.create({
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
            await tx.outbox.create({
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