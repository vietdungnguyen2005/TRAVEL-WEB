import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-session";
export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const { role } = await request.json();
        // Validate role
        const validRoles = ["CUSTOMER", "ADMIN"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Prevent changing own role
        if (user.id === session.user.id) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }
        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });
        return NextResponse.json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map