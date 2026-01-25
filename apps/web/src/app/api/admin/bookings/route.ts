import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Whitelist valid statuses to prevent injection
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "ON_HOLD"];
    const where = status && status !== "ALL" && validStatuses.includes(status) 
      ? { status: status as any } 
      : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        room: {
          include: {
            roomType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
