import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const body = await request.json();
        const upstream = await gatewayFetch(request, '/api/auth/send-verification', {
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
        console.error("Send verification error:", error);
        return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map