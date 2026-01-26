"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const security_1 = require("../../lib/security");
const rate_limit_1 = require("../../lib/rate-limit");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});
async function POST(request) {
    try {
        // Rate limiting: 5 registrations per IP per hour
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await (0, rate_limit_1.checkRateLimit)(`register:${ip}`, 5);
        if (!rateLimitResult.success) {
            return server_1.NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
        }
        const body = await request.json();
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return server_1.NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: result.error.flatten().fieldErrors }, { status: 400 });
        }
        const validatedData = result.data;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return server_1.NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                name: (0, security_1.sanitizeInput)(validatedData.name),
                email: validatedData.email.toLowerCase().trim(),
                phone: validatedData.phone ? (0, security_1.sanitizeInput)(validatedData.phone) : null,
                password: hashedPassword,
                role: "CUSTOMER",
            },
        });
        return server_1.NextResponse.json({
            message: "Đăng ký thành công",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: error.flatten().fieldErrors }, { status: 400 });
        }
        console.error("Registration error:", error);
        return server_1.NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=register.js.map