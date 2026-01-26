import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { gatewayFetch } from "@/lib/gateway";
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const upstream = await gatewayFetch(request, '/api/reviews', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...body, userId: session.user.id }),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error("Create review error:", error);
        return NextResponse.json({ error: error.message || "Failed to create review" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map