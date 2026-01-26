import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await gatewayFetch(request, '/api/auth/reset-password', {
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
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
