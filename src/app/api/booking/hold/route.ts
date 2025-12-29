import { NextRequest, NextResponse } from "next/server";
import { createHoldBooking, checkRoomAvailability } from "@/lib/booking-utils";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    const body = await request.json();
    const { 
      roomId, 
      checkIn, 
      checkOut, 
      guests,
      guestName,
      guestEmail,
      guestPhone,
      totalPrice 
    } = body;

    if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestEmail || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check room availability first
    const isAvailable = await checkRoomAvailability(
      roomId,
      checkInDate,
      checkOutDate
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Room is not available for selected dates" },
        { status: 409 }
      );
    }

    const userId = session?.user?.id || `guest_${Date.now()}`;

    const booking = await createHoldBooking(
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice
    );

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        holdExpiresAt: booking.holdExpiresAt,
        totalPrice: booking.totalPrice,
      }
    });

  } catch (error: any) {
    console.error("Hold booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
