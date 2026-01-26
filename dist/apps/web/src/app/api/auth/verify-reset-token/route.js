import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }
        const upstream = await gatewayFetch(request, `/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`, { method: 'GET' });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Verify token error:", error);
        return NextResponse.json({ error: "Failed to verify token" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map