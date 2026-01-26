import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-session";

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
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "ON_HOLD"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { status };

    // If cancelled and was paid, mark for refund
    if (status === "CANCELLED" && booking.paymentStatus === "PAID") {
      updateData.paymentStatus = "REFUNDED";
    }

    // If changing to ON_HOLD, set hold expiration
    if (status === "ON_HOLD") {
      const holdExpiresAt = new Date();
      holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);
      updateData.holdExpiresAt = holdExpiresAt;
    } else {
      // Clear hold expiration for other statuses
      updateData.holdExpiresAt = null;
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
