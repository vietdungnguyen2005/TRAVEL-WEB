"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { TrendingUp, DollarSign, Calendar, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, } from "recharts";
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}
export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("6"); // months
    useEffect(() => {
        fetchAnalytics();
    }, [period]);
    async function fetchAnalytics() {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/analytics?months=${period}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        }
        catch (error) {
            console.error("Error fetching analytics:", error);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Th\u1ED1ng k\u00EA doanh thu" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Ph\u00E2n t\u00EDch doanh thu v\u00E0 hi\u1EC7u su\u1EA5t kinh doanh" })] }), _jsxs(Select, { value: period, onValueChange: setPeriod, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "3", children: "3 th\u00E1ng g\u1EA7n \u0111\u00E2y" }), _jsx(SelectItem, { value: "6", children: "6 th\u00E1ng g\u1EA7n \u0111\u00E2y" }), _jsx(SelectItem, { value: "12", children: "12 th\u00E1ng g\u1EA7n \u0111\u00E2y" })] })] })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] })) : stats ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "T\u1ED5ng doanh thu" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats.totalRevenue) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [period, " th\u00E1ng g\u1EA7n \u0111\u00E2y"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Gi\u00E1 tr\u1ECB trung b\u00ECnh/\u0111\u01A1n" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats.averageBookingValue) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Trung b\u00ECnh m\u1ED7i \u0111\u1EB7t ph\u00F2ng" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "T\u1ED5ng \u0111\u1EB7t ph\u00F2ng" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalBookings }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "\u0110\u01A1n \u0111\u1EB7t ho\u00E0n th\u00E0nh" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "T\u1EF7 l\u1EC7 ho\u00E0n th\u00E0nh" }), _jsx(Percent, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [stats.completionRate.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "\u0110\u01A1n kh\u00F4ng b\u1ECB h\u1EE7y" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Bi\u1EC3u \u0111\u1ED3 doanh thu theo th\u00E1ng" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 350, children: _jsxs(AreaChart, { data: stats.monthlyData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "colorRevenue", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0.1 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 12 }, tickFormatter: (value) => `${(value / 1000000).toFixed(1)}M` }), _jsx(Tooltip, { formatter: (value) => formatCurrency(Number(value)), labelStyle: { color: '#000' } }), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", fillOpacity: 1, fill: "url(#colorRevenue)", name: "Doanh thu" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "S\u1ED1 l\u01B0\u1EE3ng \u0111\u1EB7t ph\u00F2ng theo th\u00E1ng" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: stats.monthlyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { tick: { fontSize: 12 } }), _jsx(Tooltip, { labelStyle: { color: '#000' }, formatter: (value) => [`${value} đơn`, "Số đặt phòng"] }), _jsx(Bar, { dataKey: "bookings", fill: "#10b981", name: "\u0110\u1EB7t ph\u00F2ng", radius: [8, 8, 0, 0] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Chi ti\u1EBFt doanh thu theo th\u00E1ng" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: stats.monthlyData.map((data, index) => {
                                            const maxRevenue = Math.max(...stats.monthlyData.map((d) => d.revenue));
                                            const percentage = (data.revenue / maxRevenue) * 100;
                                            return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "font-medium text-gray-700", children: data.month }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-gray-500", children: [data.bookings, " \u0111\u01A1n"] }), _jsx("span", { className: "font-semibold text-gray-900 w-32 text-right", children: formatCurrency(data.revenue) })] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500", style: { width: `${percentage}%` } }) })] }, index));
                                        }) }), stats.monthlyData.length === 0 && (_jsx("p", { className: "text-center text-gray-500 py-8", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u doanh thu" }))] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Ph\u00E2n t\u00EDch chi ti\u1EBFt" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b", children: [_jsx("span", { className: "text-gray-600", children: "Doanh thu cao nh\u1EA5t" }), _jsx("span", { className: "font-semibold", children: stats.monthlyData.length > 0
                                                                ? formatCurrency(Math.max(...stats.monthlyData.map((d) => d.revenue)))
                                                                : "N/A" })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b", children: [_jsx("span", { className: "text-gray-600", children: "Doanh thu th\u1EA5p nh\u1EA5t" }), _jsx("span", { className: "font-semibold", children: stats.monthlyData.length > 0
                                                                ? formatCurrency(Math.min(...stats.monthlyData.map((d) => d.revenue)))
                                                                : "N/A" })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b", children: [_jsx("span", { className: "text-gray-600", children: "Trung b\u00ECnh doanh thu/th\u00E1ng" }), _jsx("span", { className: "font-semibold", children: stats.monthlyData.length > 0
                                                                ? formatCurrency(stats.totalRevenue / stats.monthlyData.length)
                                                                : "N/A" })] }), _jsxs("div", { className: "flex justify-between items-center py-3", children: [_jsx("span", { className: "text-gray-600", children: "Trung b\u00ECnh \u0111\u01A1n/th\u00E1ng" }), _jsx("span", { className: "font-semibold", children: stats.monthlyData.length > 0
                                                                ? Math.round(stats.totalBookings / stats.monthlyData.length)
                                                                : 0 })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Xu h\u01B0\u1EDBng" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [stats.monthlyData.length >= 2 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b", children: [_jsx("span", { className: "text-gray-600", children: "T\u0103ng tr\u01B0\u1EDFng doanh thu" }), _jsxs("span", { className: `font-semibold ${stats.monthlyData[stats.monthlyData.length - 1]
                                                                        .revenue >=
                                                                        stats.monthlyData[stats.monthlyData.length - 2]
                                                                            .revenue
                                                                        ? "text-green-600"
                                                                        : "text-red-600"}`, children: [stats.monthlyData[stats.monthlyData.length - 2]
                                                                            .revenue > 0
                                                                            ? (((stats.monthlyData[stats.monthlyData.length - 1].revenue -
                                                                                stats.monthlyData[stats.monthlyData.length - 2].revenue) /
                                                                                stats.monthlyData[stats.monthlyData.length - 2].revenue) *
                                                                                100).toFixed(1)
                                                                            : "N/A", "%"] })] }), _jsxs("div", { className: "flex justify-between items-center py-3 border-b", children: [_jsx("span", { className: "text-gray-600", children: "T\u0103ng tr\u01B0\u1EDFng \u0111\u01A1n h\u00E0ng" }), _jsxs("span", { className: `font-semibold ${stats.monthlyData[stats.monthlyData.length - 1]
                                                                        .bookings >=
                                                                        stats.monthlyData[stats.monthlyData.length - 2]
                                                                            .bookings
                                                                        ? "text-green-600"
                                                                        : "text-red-600"}`, children: [stats.monthlyData[stats.monthlyData.length - 2]
                                                                            .bookings > 0
                                                                            ? (((stats.monthlyData[stats.monthlyData.length - 1].bookings -
                                                                                stats.monthlyData[stats.monthlyData.length - 2].bookings) /
                                                                                stats.monthlyData[stats.monthlyData.length - 2].bookings) *
                                                                                100).toFixed(1)
                                                                            : "N/A", "%"] })] })] })), _jsx("div", { className: "py-3", children: _jsx("p", { className: "text-sm text-gray-600", children: stats.monthlyData.length >= 2 &&
                                                            stats.monthlyData[stats.monthlyData.length - 1].revenue >=
                                                                stats.monthlyData[stats.monthlyData.length - 2].revenue
                                                            ? "📈 Doanh thu đang có xu hướng tăng trưởng tích cực"
                                                            : "📉 Cần xem xét các chiến lược để cải thiện doanh thu" }) })] }) })] })] })] })) : (_jsx(Card, { children: _jsx(CardContent, { className: "py-12 text-center", children: _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng th\u1EC3 t\u1EA3i d\u1EEF li\u1EC7u th\u1ED1ng k\u00EA" }) }) }))] }));
}
//# sourceMappingURL=page.js.map