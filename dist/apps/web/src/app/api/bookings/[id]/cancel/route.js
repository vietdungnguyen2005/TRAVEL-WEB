import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // NOTE: Authorization/ownership checks should be enforced by booking-service.
        // Current booking-service implementation is minimal; we'll harden it later.
        const upstream = await gatewayFetch(request, `/api/bookings/${encodeURIComponent(id)}/cancel`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Cancel booking error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map