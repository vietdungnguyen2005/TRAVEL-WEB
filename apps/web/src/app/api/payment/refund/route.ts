import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 3 refund requests per hour per user
    const rateLimitResult = await checkRateLimit(
      `refund:${session.user.id}`,
      3 // max 3 requests per minute (Upstash default window)
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many refund requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const session_user = session;

    const { bookingId, reason } = await request.json();

    // Validate input
    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Get booking with payment info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify ownership (user or admin)
    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if booking is eligible for refund
    if (booking.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Booking has not been paid" },
        { status: 400 }
      );
    }

    if (booking.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Booking must be cancelled first" },
        { status: 400 }
      );
    }

    if (!booking.paymentRef) {
      return NextResponse.json(
        { error: "No payment reference found" },
        { status: 400 }
      );
    }

    // Process refund via Stripe
    let refund;
    try {
      // Get the payment intent from the session or charge
      const paymentIntent = await stripe.paymentIntents.retrieve(
        booking.paymentRef,
        { expand: ['charges'] }
      ) as any;

      const charges = paymentIntent.charges;
      if (!charges?.data || charges.data.length === 0) {
        throw new Error("No charge found for this payment");
      }

      const chargeId = charges.data[0].id;

      // Create refund
      refund = await stripe.refunds.create({
        charge: chargeId,
        amount: Math.round(Number(booking.totalPrice)), // Full refund
        reason: "requested_by_customer",
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
          reason: reason || "Customer request",
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json(
        { 
          error: "Refund processing failed",
          details: stripeError.message 
        },
        { status: 500 }
      );
    }

    // Update booking with refund info
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "REFUNDED",
        adminNotes: booking.adminNotes 
          ? `${booking.adminNotes}\n[REFUND] Stripe Refund ID: ${refund.id} - ${new Date().toISOString()}`
          : `[REFUND] Stripe Refund ID: ${refund.id} - ${new Date().toISOString()}`,
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert from cents
        currency: refund.currency,
        status: refund.status,
      },
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
