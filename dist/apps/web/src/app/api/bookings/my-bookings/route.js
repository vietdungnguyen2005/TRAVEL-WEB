import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { gatewayFetch } from "@/lib/gateway";
export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const upstream = await gatewayFetch(request, `/api/bookings?userId=${encodeURIComponent(session.user.id)}`, { method: 'GET' });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Get bookings error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map