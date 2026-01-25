import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendCancellationEmail } from "@/lib/email-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel completed booking" },
        { status: 400 }
      );
    }

    // Check if booking can be cancelled (at least 24 hours before check-in)
    const checkInTime = new Date(booking.checkIn).getTime();
    const now = Date.now();
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return NextResponse.json(
        { 
          error: "Bookings can only be cancelled at least 24 hours before check-in",
          hoursRemaining: Math.max(0, Math.floor(hoursUntilCheckIn))
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: "CANCELLED",
    };

    // If booking was paid, mark for refund
    if (booking.paymentStatus === "PAID") {
      updateData.paymentStatus = "REFUNDED";
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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

    // Determine refund amount
    const refundAmount = booking.paymentStatus === 'PAID' ? Number(booking.totalPrice) : undefined;

    // Send cancellation email (don't await to avoid blocking)
    sendCancellationEmail(updatedBooking as any, refundAmount).catch((error) => {
      console.error('Failed to send cancellation email:', error);
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
