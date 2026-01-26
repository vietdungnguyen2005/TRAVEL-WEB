import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    const upstream = await gatewayFetch(request, "/api/payments/webhook", {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") || "application/json",
        "stripe-signature": signature,
      },
      // raw body
      body,
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
