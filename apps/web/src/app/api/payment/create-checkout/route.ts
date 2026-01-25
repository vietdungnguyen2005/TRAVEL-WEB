import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (booking.status !== "ON_HOLD" && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Booking is not available for payment" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "vnd",
            product_data: {
              name: booking.room.roomType.name,
              description: `Room ${booking.room.roomNumber} - ${booking.numberOfGuests} guests | Check-in: ${booking.checkIn.toLocaleDateString("vi-VN")}`,
              images: booking.room.roomType.images?.slice(0, 1) || [],
            },
            unit_amount: Math.round(Number(booking.totalPrice)),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: booking.user.email,
      client_reference_id: booking.id,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel?booking_id=${bookingId}`,
      metadata: {
        bookingId: booking.id,
        userId: booking.userId,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Update booking with payment session ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        paymentRef: checkoutSession.id,
      },
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
