import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bed, DollarSign, TrendingUp, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
async function getStatistics() {
    try {
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
        const revenueGrowth = revenueLastMonth._sum.totalPrice && Number(revenueLastMonth._sum.totalPrice) > 0
            ? ((Number(revenueThisMonth._sum.totalPrice || 0) -
                Number(revenueLastMonth._sum.totalPrice)) /
                Number(revenueLastMonth._sum.totalPrice)) *
                100
            : 0;
        const bookingGrowth = bookingsLastMonth > 0
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
    catch (err) {
        // If DB is unreachable during build/prerender, return safe defaults
        // eslint-disable-next-line no-console
        console.error('Prisma error in getStatistics:', err);
        return {
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
    }
}
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}
function getStatusColor(status) {
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
function getStatusText(status) {
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
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "T\u1ED5ng quan" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Ch\u00E0o m\u1EEBng \u0111\u1EBFn trang qu\u1EA3n tr\u1ECB h\u1EC7 th\u1ED1ng" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Doanh thu th\u00E1ng n\u00E0y" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats.revenueThisMonth) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: stats.revenueGrowth > 0 ? (_jsxs("span", { className: "text-green-600 flex items-center gap-1", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), "+", stats.revenueGrowth.toFixed(1), "% so v\u1EDBi th\u00E1ng tr\u01B0\u1EDBc"] })) : (_jsxs("span", { className: "text-red-600", children: [stats.revenueGrowth.toFixed(1), "% so v\u1EDBi th\u00E1ng tr\u01B0\u1EDBc"] })) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u0110\u1EB7t ph\u00F2ng th\u00E1ng n\u00E0y" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.bookingsThisMonth }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: stats.bookingGrowth > 0 ? (_jsxs("span", { className: "text-green-600 flex items-center gap-1", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), "+", stats.bookingGrowth.toFixed(1), "% so v\u1EDBi th\u00E1ng tr\u01B0\u1EDBc"] })) : (_jsxs("span", { className: "text-red-600", children: [stats.bookingGrowth.toFixed(1), "% so v\u1EDBi th\u00E1ng tr\u01B0\u1EDBc"] })) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u0110\u01A1n ch\u1EDD x\u1EED l\u00FD" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.pendingBookings }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "C\u1EA7n x\u00E1c nh\u1EADn ngay" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "T\u1ED5ng s\u1ED1 ph\u00F2ng" }), _jsx(Bed, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalRooms }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.totalUsers, " ng\u01B0\u1EDDi d\u00F9ng"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u0110\u1EB7t ph\u00F2ng g\u1EA7n \u0111\u00E2y" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: stats.recentBookings.map((booking) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: booking.user.name || booking.user.email }), _jsxs("p", { className: "text-sm text-gray-500", children: [booking.room.roomType.name, " - Ph\u00F2ng ", booking.room.roomNumber] })] }) }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-600", children: [_jsxs("span", { children: [format(new Date(booking.checkIn), "dd/MM/yyyy"), " -", " ", format(new Date(booking.checkOut), "dd/MM/yyyy")] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [booking.numberOfGuests, " kh\u00E1ch"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-gray-900", children: formatCurrency(Number(booking.totalPrice)) }), _jsx("span", { className: `inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(booking.status)}`, children: getStatusText(booking.status) })] })] }, booking.id))) }) })] })] }));
}
//# sourceMappingURL=page.js.map