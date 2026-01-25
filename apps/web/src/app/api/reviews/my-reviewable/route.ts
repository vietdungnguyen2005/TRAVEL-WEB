import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all completed bookings without reviews
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        reviews: {
          none: {},
        },
      },
      include: {
        room: {
          include: {
            roomType: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        checkOut: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Get reviewable bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
