"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const security_1 = require("../../lib/security");
async function POST(request) {
    try {
        const { token, password } = await request.json();
        if (!token || !password) {
            return server_1.NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }
        if (password.length < 8) {
            return server_1.NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        // Find token
        const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!resetToken) {
            return server_1.NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
        }
        // Check if expired
        if (resetToken.expiresAt < new Date()) {
            // Delete expired token
            await prisma_1.prisma.passwordResetToken.delete({
                where: { token },
            });
            return server_1.NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
        }
        // Update user password
        const hashedPassword = await bcryptjs_1.default.hash((0, security_1.sanitizeInput)(password), 10);
        await prisma_1.prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });
        // Delete token after successful reset
        await prisma_1.prisma.passwordResetToken.delete({
            where: { token },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=reset-password.js.map