import { z } from 'zod';
export declare const CreateBookingSchema: z.ZodObject<{
    roomId: z.ZodString;
    userId: z.ZodString;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    guests: z.ZodNumber;
    totalPrice: z.ZodNumber;
}, z.core.$strip>;
export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export declare const BookingResponseSchema: z.ZodObject<{
    id: z.ZodString;
    roomId: z.ZodString;
    userId: z.ZodString;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
    }>;
    totalPrice: z.ZodNumber;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type BookingResponseDTO = z.infer<typeof BookingResponseSchema>;
export type BookingRequest = CreateBookingDTO;
export type BookingResponse = BookingResponseDTO;
//# sourceMappingURL=booking.d.ts.map