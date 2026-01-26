import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const body = await request.json();
        const { roomId, checkIn, checkOut } = body;
        if (!roomId || !checkIn || !checkOut) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const upstream = await gatewayFetch(request, '/api/bookings/check-availability', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ roomId, checkIn, checkOut }),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Availability check error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map