import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomTypeId } = await params;
    const qs = request.nextUrl.searchParams.toString();
    const upstream = await gatewayFetch(
      request,
      `/api/reviews/room-type/${encodeURIComponent(roomTypeId)}${qs ? `?${qs}` : ''}`,
      { method: 'GET' }
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
