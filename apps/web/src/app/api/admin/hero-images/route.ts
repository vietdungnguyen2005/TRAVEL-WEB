import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List all hero images
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const heroImages = await prisma.heroImage.findMany({
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

// POST - Create new hero image
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      imageUrl,
      buttonText,
      buttonLink,
      order = 0,
      active = true,
    } = body;

    // Validation
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const heroImage = await prisma.heroImage.create({
      data: {
        title,
        subtitle,
        imageUrl,
        buttonText,
        buttonLink,
        order: parseInt(order),
        active,
      },
    });

    return NextResponse.json(heroImage, { status: 201 });
  } catch (error) {
    console.error("Error creating hero image:", error);
    return NextResponse.json(
      { error: "Failed to create hero image" },
      { status: 500 }
    );
  }
}
