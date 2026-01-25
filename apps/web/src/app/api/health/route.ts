import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health Check Endpoint
 * Used by monitoring services to verify the application is running
 * and database connection is working
 */
export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
        version: process.env.npm_package_version || "1.0.0",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[HEALTH_CHECK]", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
