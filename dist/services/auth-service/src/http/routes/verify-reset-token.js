import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        // Find token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error verifying reset token:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=verify-reset-token.js.map