import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredHolds } from "@/lib/booking-utils";

/**
 * API endpoint to cleanup expired hold bookings
 * This should be called periodically (e.g., via cron job)
 * 
 * For production, use:
 * - Vercel Cron Jobs
 * - GitHub Actions scheduled workflows
 * - External cron service
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || "your-secret-key"}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await cleanupExpiredHolds();

    return NextResponse.json({
      success: true,
      message: "Expired hold bookings cleaned up successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup expired holds" },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await cleanupExpiredHolds();

    return NextResponse.json({
      success: true,
      message: "Expired hold bookings cleaned up successfully (DEV)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup expired holds" },
      { status: 500 }
    );
  }
}
