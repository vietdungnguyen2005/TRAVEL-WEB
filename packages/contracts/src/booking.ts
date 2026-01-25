import { z } from 'zod';

// Booking DTOs
export const CreateBookingSchema = z.object({
    roomId: z.string().uuid(),
    userId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guests: z.number().min(1),
    totalPrice: z.number().positive()
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;

export const BookingResponseSchema = z.object({
    id: z.string().uuid(),
    roomId: z.string().uuid(),
    userId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
    totalPrice: z.number(),
    createdAt: z.string().datetime()
});

export type BookingResponseDTO = z.infer<typeof BookingResponseSchema>;

// Added BookingRequest and BookingResponse types
export type BookingRequest = CreateBookingDTO;
export type BookingResponse = BookingResponseDTO;