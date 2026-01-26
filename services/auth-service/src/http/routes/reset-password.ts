import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { sanitizeInput } from "../../lib/security";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Find token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid reset token" },
                { status: 400 }
            );
        }

        // Check if expired
        if (resetToken.expiresAt < new Date()) {
            // Delete expired token
            await prisma.passwordResetToken.delete({
                where: { token },
            });

            return NextResponse.json(
                { error: "Reset token has expired" },
                { status: 400 }
            );
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(sanitizeInput(password), 10);
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        // Delete token after successful reset
        await prisma.passwordResetToken.delete({
            where: { token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
