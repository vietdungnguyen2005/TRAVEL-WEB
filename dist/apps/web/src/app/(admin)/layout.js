import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import Link from "next/link";
import { Home, Calendar, Bed, Users, BarChart3, Image } from "lucide-react";
export default async function AdminLayout({ children, }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }
    const navItems = [
        {
            href: "/admin",
            label: "Tổng quan",
            icon: Home,
        },
        {
            href: "/admin/bookings",
            label: "Quản lý đặt phòng",
            icon: Calendar,
        },
        {
            href: "/admin/room-types",
            label: "Quản lý loại phòng",
            icon: Bed,
        },
        {
            href: "/admin/rooms",
            label: "Quản lý phòng",
            icon: Bed,
        },
        {
            href: "/admin/hero-images",
            label: "Ảnh trang chủ",
            icon: Image,
        },
        {
            href: "/admin/users",
            label: "Quản lý người dùng",
            icon: Users,
        },
        {
            href: "/admin/analytics",
            label: "Thống kê",
            icon: BarChart3,
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white border-b border-gray-200 sticky top-0 z-50", children: _jsx("div", { className: "px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center gap-8", children: _jsx(Link, { href: "/admin", className: "text-xl font-bold text-blue-600", children: "Admin Panel" }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Link, { href: "/", className: "text-sm text-gray-600 hover:text-gray-900", children: "\u2190 V\u1EC1 trang ch\u1EE7" }), _jsx("div", { className: "text-sm text-gray-600", children: session.user.name || session.user.email })] })] }) }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: "w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16", children: _jsx("nav", { className: "p-4 space-y-1", children: navItems.map((item) => {
                                const Icon = item.icon;
                                return (_jsxs(Link, { href: item.href, className: "flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { children: item.label })] }, item.href));
                            }) }) }), _jsx("main", { className: "flex-1 p-8", children: children })] })] }));
}
//# sourceMappingURL=layout.js.map