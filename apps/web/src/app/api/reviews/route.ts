import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, rating, comment } = await request.json();

    // Validate input
    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: "Booking ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          select: {
            roomTypeId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only allow reviews for completed bookings
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment ? sanitizeInput(comment) : null,
        userId: session.user.id,
        bookingId,
        roomTypeId: booking.room.roomTypeId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
