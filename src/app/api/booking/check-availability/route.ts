import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRoomAvailability } from "@/lib/booking-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomTypeId, checkIn, checkOut, guests } = body;

    if (!roomTypeId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        rooms: {
          where: { status: "AVAILABLE" },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    if (guests > roomType.capacity) {
      return NextResponse.json(
        { error: "Number of guests exceeds room capacity" },
        { status: 400 }
      );
    }

    let availableRoom = null;
    for (const room of roomType.rooms) {
      const isAvailable = await checkRoomAvailability(
        room.id,
        checkInDate,
        checkOutDate
      );
      if (isAvailable) {
        availableRoom = room;
        break;
      }
    }

    if (!availableRoom) {
      return NextResponse.json(
        { 
          available: false,
          message: "No rooms available for the selected dates"
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      available: true,
      roomId: availableRoom.id,
      roomNumber: availableRoom.roomNumber,
      message: "Room is available"
    });

  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
