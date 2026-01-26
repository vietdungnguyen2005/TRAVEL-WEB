import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
export async function POST(request) {
    try {
        const { token } = await request.json();
        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        // Find token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
        }
        // Check if expired
        if (verificationToken.expires < new Date()) {
            // Delete expired token
            await prisma.verificationToken.delete({
                where: { token },
            });
            return NextResponse.json({ error: "Verification token has expired" }, { status: 400 });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Update user verification status
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });
        // Delete token after successful verification
        await prisma.verificationToken.delete({
            where: { token },
        });
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=verify-email.js.map