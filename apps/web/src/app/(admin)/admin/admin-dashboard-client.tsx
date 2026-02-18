"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bed, DollarSign, TrendingUp, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";

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

export function AdminDashboardClient() {
    const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await gatewayFetch("/api/admin/stats", {
                    method: "GET",
                    cache: "no-store",
                    attachAccessToken: true,
                });
                if (cancelled) return;
                if (!res.ok) {
                    setStats(EMPTY_STATS);
                    return;
                }
                const data = (await res.json()) as Partial<AdminStats>;
                setStats({
                    ...EMPTY_STATS,
                    ...data,
                    recentBookings: Array.isArray(data.recentBookings) ? data.recentBookings : [],
                });
            } catch {
                if (!cancelled) setStats(EMPTY_STATS);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500 mt-2">Chào mừng đến trang quản trị hệ thống</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mr-2" />
                            Đang tải...
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <p className="text-gray-500 mt-2">Chào mừng đến trang quản trị hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.revenueGrowth > 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />+{stats.revenueGrowth.toFixed(1)}% so với tháng trước
                                </span>
                            ) : (
                                <span className="text-red-600">{stats.revenueGrowth.toFixed(1)}% so với tháng trước</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đặt phòng tháng này</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookingsThisMonth}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.bookingGrowth > 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />+{stats.bookingGrowth.toFixed(1)}% so với tháng trước
                                </span>
                            ) : (
                                <span className="text-red-600">{stats.bookingGrowth.toFixed(1)}% so với tháng trước</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cần xác nhận ngay</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRooms}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats.totalUsers} người dùng</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Đặt phòng gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentBookings.length === 0 ? (
                            <p className="text-gray-500 py-4">Chưa có đơn đặt phòng gần đây.</p>
                        ) : (
                            stats.recentBookings.map((booking: any) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {booking.user?.name || booking.user?.email}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {booking.room?.roomType?.name} - Phòng {booking.room?.roomNumber}
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
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
