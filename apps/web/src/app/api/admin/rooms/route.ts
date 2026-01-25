import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      include: {
        roomType: {
          select: {
            name: true,
            pricePerNight: true,
          },
        },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomNumber, floor, status, roomTypeId } = await request.json();

    // Validate required fields
    if (!roomNumber || !floor || !status || !roomTypeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findFirst({
      where: { roomNumber },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: "Room number already exists" },
        { status: 400 }
      );
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        roomNumber,
        floor: parseInt(floor),
        status,
        roomTypeId,
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

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
