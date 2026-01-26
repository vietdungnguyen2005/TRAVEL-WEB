import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import Link from "next/link";
import { Home, Calendar, Bed, Users, BarChart3, Settings, Image } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/admin" className="text-xl font-bold text-blue-600">
                                Admin Panel
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Về trang chủ
                            </Link>
                            <div className="text-sm text-gray-600">
                                {session.user.name || session.user.email}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}
