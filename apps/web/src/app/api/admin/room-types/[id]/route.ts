import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// UPDATE room type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      pricePerNight,
      capacity,
      bedCount,
      size,
      amenities,
      images,
      featured,
      available,
    } = body;

    // Generate slug from name if name is provided
    const slug = name
      ? name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : undefined;

    const roomType = await prisma.roomType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(pricePerNight !== undefined && { pricePerNight }),
        ...(capacity !== undefined && { capacity }),
        ...(bedCount !== undefined && { bedCount }),
        ...(size !== undefined && { size }),
        ...(amenities !== undefined && { amenities }),
        ...(images !== undefined && { images }),
        ...(featured !== undefined && { featured }),
        ...(available !== undefined && { available }),
      },
    });

    return NextResponse.json(roomType);
  } catch (error: any) {
    console.error("Error updating room type:", error);
    return NextResponse.json(
      { error: "Failed to update room type", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE room type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if there are rooms using this room type
    const roomCount = await prisma.room.count({
      where: { roomTypeId: id },
    });

    if (roomCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete",
          message: `This room type is used by ${roomCount} room(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.roomType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting room type:", error);
    return NextResponse.json(
      { error: "Failed to delete room type", message: error.message },
      { status: 500 }
    );
  }
}
