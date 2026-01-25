"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingResponseSchema = exports.CreateBookingSchema = void 0;
const zod_1 = require("zod");
// Booking DTOs
exports.CreateBookingSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    checkIn: zod_1.z.string().datetime(),
    checkOut: zod_1.z.string().datetime(),
    guests: zod_1.z.number().min(1),
    totalPrice: zod_1.z.number().positive()
});
exports.BookingResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    roomId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    checkIn: zod_1.z.string().datetime(),
    checkOut: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
    totalPrice: zod_1.z.number(),
    createdAt: zod_1.z.string().datetime()
});
