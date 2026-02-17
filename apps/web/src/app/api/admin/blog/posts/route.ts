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

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  return proxyJson(req, "/api/admin/blog/posts");
}

export async function POST(req: NextRequest) {
  return proxyJson(req, "/api/admin/blog/posts");
}
