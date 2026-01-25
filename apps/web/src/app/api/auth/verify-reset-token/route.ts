import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Check if expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: verificationToken.identifier,
    });
  } catch (error: any) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
