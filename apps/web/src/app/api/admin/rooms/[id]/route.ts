import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { roomNumber, floor, status, roomTypeId } = await request.json();

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room number is being changed and already exists
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await prisma.room.findFirst({
        where: { roomNumber, id: { not: id } },
      });

      if (existingRoom) {
        return NextResponse.json(
          { error: "Room number already exists" },
          { status: 400 }
        );
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(roomNumber && { roomNumber }),
        ...(floor && { floor: parseInt(floor) }),
        ...(status && { status }),
        ...(roomTypeId && { roomTypeId }),
      },
      include: {
        roomType: {
          select: {
            name: true,
            pricePerNight: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if room has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        roomId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with active bookings" },
        { status: 400 }
      );
    }

    // Delete room
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
