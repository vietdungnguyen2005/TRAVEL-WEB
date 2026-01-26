import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const body = await request.json();
        if (!body?.bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }
        const upstream = await gatewayFetch(request, '/api/payments/confirm', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Confirm payment error:", error);
        return NextResponse.json({ error: error.message || "Failed to confirm payment" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map