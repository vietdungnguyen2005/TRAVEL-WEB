import { z } from "zod";
// Input sanitization function
export function sanitizeInput(input) {
    if (typeof input !== 'string')
        return '';
    // Remove potential XSS characters
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}
// Validation schemas for forms
export const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export const registerSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().optional(),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});
export const bookingSchema = z.object({
    roomId: z.string(),
    checkIn: z.date(),
    checkOut: z.date(),
    numberOfGuests: z.number().min(1).max(10),
    guestName: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().optional(),
    specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkOut"],
});
export const roomTypeSchema = z.object({
    name: z.string().min(2, "Tên phòng phải có ít nhất 2 ký tự"),
    slug: z.string().min(2),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
    pricePerNight: z.number().min(0, "Giá phải lớn hơn 0"),
    capacity: z.number().min(1, "Số người phải lớn hơn 0"),
    bedCount: z.number().min(1),
    size: z.number().optional(),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
    featured: z.boolean().default(false),
    available: z.boolean().default(true),
});
//# sourceMappingURL=validations.js.map