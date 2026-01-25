import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 404 }
      );
    }

    // Get booking ID from metadata
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID not found in session" },
        { status: 400 }
      );
    }

    // Check payment status
    if (session.payment_status === "paid") {
      // Update booking status to CONFIRMED
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentRef: session.payment_intent as string,
          paymentStatus: "PAID",
          paymentMethod: "STRIPE",
          paidAt: new Date(),
        },
        include: {
          room: {
            include: {
              roomType: true,
            },
          },
          user: true,
        },
      });

      return NextResponse.json({
        success: true,
        booking,
      });
    }

    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
