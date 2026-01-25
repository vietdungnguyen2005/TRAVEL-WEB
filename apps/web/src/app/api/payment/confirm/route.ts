import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentMethod } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "ON_HOLD") {
      return NextResponse.json(
        { error: "Booking is not available for confirmation" },
        { status: 400 }
      );
    }

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PAID",
        paymentMethod: paymentMethod || "CASH",
        holdExpiresAt: null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        room: {
          include: {
            roomType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email (don't await to avoid blocking)
    sendBookingConfirmationEmail(updatedBooking as any).catch((error) => {
      console.error('Failed to send booking confirmation email:', error);
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
