"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        if (!token) {
            return server_1.NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        // Find token
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            return server_1.NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error verifying reset token:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=verify-reset-token.js.map