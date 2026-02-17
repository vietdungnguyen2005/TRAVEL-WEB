import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxyJson(req: NextRequest, path: string) {
  const contentType = req.headers.get("content-type") ?? "application/json";
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  const accessToken = req.cookies.get("access_token")?.value;
  const authHeader = req.headers.get("authorization") ?? undefined;
  const authorization = authHeader || (accessToken ? `Bearer ${accessToken}` : undefined);

  const upstream = await gatewayFetch(req, path, {
    method: req.method,
    headers: {
      "content-type": contentType,
      accept: "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body,
  });

  // Preserve 204s without forcing a body.
  if (upstream.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
      },
    });
  }

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyJson(req, `/api/admin/blog/posts/${encodeURIComponent(id)}`);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyJson(req, `/api/admin/blog/posts/${encodeURIComponent(id)}`);
}
