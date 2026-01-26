"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function POST(request) {
    try {
        const { token } = await request.json();
        if (!token) {
            return server_1.NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        // Find token
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            return server_1.NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
        }
        // Check if expired
        if (verificationToken.expires < new Date()) {
            // Delete expired token
            await prisma_1.prisma.verificationToken.delete({
                where: { token },
            });
            return server_1.NextResponse.json({ error: "Verification token has expired" }, { status: 400 });
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Update user verification status
        await prisma_1.prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });
        // Delete token after successful verification
        await prisma_1.prisma.verificationToken.delete({
            where: { token },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Verification error:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=verify-email.js.map