import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Public endpoint to fetch active hero images
export async function GET(request: NextRequest) {
  try {
    const heroImages = await prisma.heroImage.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(heroImages);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}
