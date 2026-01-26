import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const session = await auth();
        const body = await request.json();
        const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, totalPrice } = body;
        if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestEmail || !totalPrice) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const userId = session?.user?.id || `guest_${Date.now()}`;
        const upstream = await gatewayFetch(request, '/api/bookings/hold', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                userId,
                roomId,
                checkIn,
                checkOut,
                numberOfGuests: guests,
                totalPrice,
                guestName,
                guestEmail,
                guestPhone,
            }),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Hold booking error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map