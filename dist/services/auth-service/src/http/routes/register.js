import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sanitizeInput } from "../../lib/security";
import { checkRateLimit } from "../../lib/rate-limit";
const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});
export async function POST(request) {
    try {
        // Rate limiting: 5 registrations per IP per hour
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await checkRateLimit(`register:${ip}`, 5);
        if (!rateLimitResult.success) {
            return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
        }
        const body = await request.json();
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: result.error.flatten().fieldErrors }, { status: 400 });
        }
        const validatedData = result.data;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                name: sanitizeInput(validatedData.name),
                email: validatedData.email.toLowerCase().trim(),
                phone: validatedData.phone ? sanitizeInput(validatedData.phone) : null,
                password: hashedPassword,
                role: "CUSTOMER",
            },
        });
        return NextResponse.json({
            message: "Đăng ký thành công",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: error.flatten().fieldErrors }, { status: 400 });
        }
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=register.js.map