import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomTypeId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const pageParam = parseInt(searchParams.get("page") || "1");
    const limitParam = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    if (isNaN(pageParam) || pageParam < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter. Must be >= 1" },
        { status: 400 }
      );
    }
    if (isNaN(limitParam) || limitParam < 1 || limitParam > 100) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 100" },
        { status: 400 }
      );
    }

    const page = pageParam;
    const limit = limitParam;
    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { roomTypeId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { roomTypeId },
      }),
    ]);

    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
      where: { roomTypeId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { roomTypeId },
      _count: {
        rating: true,
      },
    });

    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const found = ratingDistribution.find((r: any) => r.rating === rating);
      return {
        rating,
        count: found?._count.rating || 0,
      };
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating,
        distribution,
      },
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
