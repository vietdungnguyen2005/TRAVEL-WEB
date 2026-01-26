import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        // Rate limiting: 5 registrations per IP per hour
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await checkRateLimit(`register:${ip}`, 5);
        if (!rateLimitResult.success) {
            return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
        }
        const body = await request.json();
        const upstream = await gatewayFetch(request, '/api/auth/register', {
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
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Đã có lỗi xảy ra" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map