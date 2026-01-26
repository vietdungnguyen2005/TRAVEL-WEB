import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const upstream = await gatewayFetch(request, '/api/payments/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
