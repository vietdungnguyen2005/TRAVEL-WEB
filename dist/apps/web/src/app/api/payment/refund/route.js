import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Rate limit: 3 refund requests per hour per user
        const rateLimitResult = await checkRateLimit(`refund:${session.user.id}`, 3 // max 3 requests per minute (Upstash default window)
        );
        if (!rateLimitResult.success) {
            return NextResponse.json({
                error: "Too many refund requests. Please try again later.",
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
            }, {
                status: 429,
                headers: {
                    "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
                    "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
                },
            });
        }
        const { bookingId, reason } = await request.json();
        // Validate input
        if (!bookingId || typeof bookingId !== 'string') {
            return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
        }
        const upstream = await gatewayFetch(request, '/api/payments/refund', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ bookingId, reason, userId: session.user.id }),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Refund error:", error);
        return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map