import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-session";
// PUT - Update hero image
export async function PUT(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { title, subtitle, imageUrl, buttonText, buttonLink, order, active, } = body;
        const { id } = await params;
        // Check if hero image exists
        const existing = await prisma.heroImage.findUnique({
            where: { id },
        });
        if (!existing) {
            return NextResponse.json({ error: "Hero image not found" }, { status: 404 });
        }
        const heroImage = await prisma.heroImage.update({
            where: { id },
            data: {
                title,
                subtitle,
                imageUrl,
                buttonText,
                buttonLink,
                order: order !== undefined ? parseInt(order) : undefined,
                active,
            },
        });
        return NextResponse.json(heroImage);
    }
    catch (error) {
        console.error("Error updating hero image:", error);
        return NextResponse.json({ error: "Failed to update hero image" }, { status: 500 });
    }
}
// DELETE - Delete hero image
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        // Check if hero image exists
        const existing = await prisma.heroImage.findUnique({
            where: { id },
        });
        if (!existing) {
            return NextResponse.json({ error: "Hero image not found" }, { status: 404 });
        }
        await prisma.heroImage.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting hero image:", error);
        return NextResponse.json({ error: "Failed to delete hero image" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map