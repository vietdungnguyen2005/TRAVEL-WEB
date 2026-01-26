import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { findAllRoomTypes, createRoomType } from "@/lib/prisma";
// GET all room types
export async function GET() {
    try {
        const roomTypes = await findAllRoomTypes();
        return NextResponse.json(roomTypes);
    }
    catch (error) {
        console.error("Error fetching room types:", error);
        return NextResponse.json({ error: "Failed to fetch room types" }, { status: 500 });
    }
}
// CREATE new room type
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { name, description, pricePerNight, capacity, bedCount, size, amenities, images, featured, available, } = body;
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const roomType = await createRoomType({
            name,
            slug,
            description: description || "",
            pricePerNight,
            capacity,
            bedCount,
            size,
            amenities: amenities || [],
            images: images || [],
            featured: featured || false,
            available: available !== false,
        });
        return NextResponse.json(roomType);
    }
    catch (error) {
        console.error("Error creating room type:", error);
        return NextResponse.json({ error: "Failed to create room type", message: error.message }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map