import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
  format,
} from "date-fns";
import { vi } from "date-fns/locale";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const monthsParam = parseInt(searchParams.get("months") || "6");
    
    // Validate months parameter (1-24 months range)
    if (isNaN(monthsParam) || monthsParam < 1 || monthsParam > 24) {
      return NextResponse.json(
        { error: "Invalid months parameter. Must be between 1 and 24" },
        { status: 400 }
      );
    }
    const months = monthsParam;

    const now = new Date();
    const startDate = startOfMonth(subMonths(now, months - 1));
    const endDate = endOfMonth(now);

    // Get all bookings in the period
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ["CONFIRMED", "COMPLETED"] },
        paymentStatus: "PAID",
      },
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        status: true,
      },
    });

    // Calculate total stats
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    );
    const totalBookings = bookings.length;
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate completion rate
    const allBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const completionRate =
      allBookings > 0 ? (totalBookings / allBookings) * 100 : 0;

    // Group by month
    const monthsInterval = eachMonthOfInterval({
      start: startDate,
      end: endDate,
    });

    const monthlyData = monthsInterval.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const revenue = monthBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0
      );

      return {
        month: format(month, "MM/yyyy", { locale: vi }),
        revenue,
        bookings: monthBookings.length,
      };
    });

    return NextResponse.json({
      totalRevenue,
      averageBookingValue,
      totalBookings,
      completionRate,
      monthlyData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
