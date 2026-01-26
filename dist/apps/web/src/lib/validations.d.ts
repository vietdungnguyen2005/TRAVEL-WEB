import { z } from "zod";
export declare function sanitizeInput(input: string): string;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const bookingSchema: z.ZodObject<{
    roomId: z.ZodString;
    checkIn: z.ZodDate;
    checkOut: z.ZodDate;
    numberOfGuests: z.ZodNumber;
    guestName: z.ZodOptional<z.ZodString>;
    guestEmail: z.ZodOptional<z.ZodString>;
    guestPhone: z.ZodOptional<z.ZodString>;
    specialRequests: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const roomTypeSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    pricePerNight: z.ZodNumber;
    capacity: z.ZodNumber;
    bedCount: z.ZodNumber;
    size: z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodArray<z.ZodString>;
    images: z.ZodArray<z.ZodString>;
    featured: z.ZodDefault<z.ZodBoolean>;
    available: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
//# sourceMappingURL=validations.d.ts.map