import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { gatewayFetch } from "@/lib/gateway";

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

    const upstream = await gatewayFetch(request, '/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        userId: session.user.id,
        email: session.user.email,
        // NOTE: amount should come from booking-service/room-service; passing 0 keeps BC for now.
        amount: 0,
        currency: 'vnd',
      }),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error: any) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
