import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bed, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { gatewayFetch } from "@/lib/gateway-client";

export const dynamic = "force-dynamic";

type AdminStats = {
    totalBookings: number;
    totalRooms: number;
    totalUsers: number;
    pendingBookings: number;
    revenueThisMonth: number;
    revenueGrowth: number;
    bookingsThisMonth: number;
    bookingGrowth: number;
    recentBookings: any[];
};

const EMPTY_STATS: AdminStats = {
    totalBookings: 0,
    totalRooms: 0,
    totalUsers: 0,
    pendingBookings: 0,
    revenueThisMonth: 0,
    revenueGrowth: 0,
    bookingsThisMonth: 0,
    bookingGrowth: 0,
    recentBookings: [],
};

async function getStatistics(): Promise<AdminStats> {
    try {
        // NOTE: UI-only web: stats should come from gateway/service, not Prisma directly.
        // If this endpoint isn't implemented yet, we fall back to zeros so the admin page still renders.
        const res = await gatewayFetch("/api/admin/stats", {
            method: "GET",
            cache: "no-store",
        });
        if (!res.ok) return EMPTY_STATS;
        const data = (await res.json()) as Partial<AdminStats>;
        return {
            ...EMPTY_STATS,
            ...data,
            recentBookings: Array.isArray(data.recentBookings) ? data.recentBookings : [],
        };
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error in getStatistics:", err);
        return EMPTY_STATS;
    }
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
                        {stats.recentBookings.map((booking: any) => (
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
