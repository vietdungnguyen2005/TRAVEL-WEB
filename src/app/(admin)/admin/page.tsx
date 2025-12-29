import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bed, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { vi } from "date-fns/locale";

async function getStatistics() {
  const now = new Date();
  const firstDayThisMonth = startOfMonth(now);
  const lastDayThisMonth = endOfMonth(now);
  const firstDayLastMonth = startOfMonth(subMonths(now, 1));
  const lastDayLastMonth = endOfMonth(subMonths(now, 1));

  // Total counts
  const [totalBookings, totalRooms, totalUsers, pendingBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.room.count(),
    prisma.user.count(),
    prisma.booking.count({
      where: { status: "PENDING" },
    }),
  ]);

  // Revenue this month
  const revenueThisMonth = await prisma.booking.aggregate({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      createdAt: {
        gte: firstDayThisMonth,
        lte: lastDayThisMonth,
      },
    },
    _sum: {
      totalPrice: true,
    },
  });

  // Revenue last month
  const revenueLastMonth = await prisma.booking.aggregate({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      createdAt: {
        gte: firstDayLastMonth,
        lte: lastDayLastMonth,
      },
    },
    _sum: {
      totalPrice: true,
    },
  });

  // Bookings this month
  const bookingsThisMonth = await prisma.booking.count({
    where: {
      createdAt: {
        gte: firstDayThisMonth,
        lte: lastDayThisMonth,
      },
    },
  });

  // Bookings last month
  const bookingsLastMonth = await prisma.booking.count({
    where: {
      createdAt: {
        gte: firstDayLastMonth,
        lte: lastDayLastMonth,
      },
    },
  });

  // Recent bookings
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
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
  });

  // Calculate growth rates
  const revenueGrowth =
    revenueLastMonth._sum.totalPrice && Number(revenueLastMonth._sum.totalPrice) > 0
      ? ((Number(revenueThisMonth._sum.totalPrice || 0) -
          Number(revenueLastMonth._sum.totalPrice)) /
          Number(revenueLastMonth._sum.totalPrice)) *
        100
      : 0;

  const bookingGrowth =
    bookingsLastMonth > 0
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : 0;

  return {
    totalBookings,
    totalRooms,
    totalUsers,
    pendingBookings,
    revenueThisMonth: Number(revenueThisMonth._sum.totalPrice || 0),
    revenueGrowth,
    bookingsThisMonth,
    bookingGrowth,
    recentBookings,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

export default async function AdminDashboard() {
  const stats = await getStatistics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 mt-2">
          Chào mừng đến trang quản trị hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng này
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.revenueThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.revenueGrowth > 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />+{stats.revenueGrowth.toFixed(1)}% so với
                  tháng trước
                </span>
              ) : (
                <span className="text-red-600">
                  {stats.revenueGrowth.toFixed(1)}% so với tháng trước
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đặt phòng tháng này
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bookingGrowth > 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />+{stats.bookingGrowth.toFixed(1)}% so với
                  tháng trước
                </span>
              ) : (
                <span className="text-red-600">
                  {stats.bookingGrowth.toFixed(1)}% so với tháng trước
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Pending Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn chờ xử lý
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cần xác nhận ngay
            </p>
          </CardContent>
        </Card>

        {/* Total Rooms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUsers} người dùng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Đặt phòng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.user.name || booking.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.room.roomType.name} - Phòng {booking.room.roomNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>
                      {format(new Date(booking.checkIn), "dd/MM/yyyy")} -{" "}
                      {format(new Date(booking.checkOut), "dd/MM/yyyy")}
                    </span>
                    <span>•</span>
                    <span>{booking.numberOfGuests} khách</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Number(booking.totalPrice))}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
