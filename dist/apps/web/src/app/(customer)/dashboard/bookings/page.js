import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingItem } from "@/components/booking/booking-item";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { ClientLayout } from "@/components/layout/client-layout";
export default async function MyBookingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/auth/login");
    }
    const bookings = await prisma.booking.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            room: {
                include: {
                    roomType: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "\u0110\u1EB7t ph\u00F2ng c\u1EE7a t\u00F4i" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Qu\u1EA3n l\u00FD t\u1EA5t c\u1EA3 c\u00E1c \u0111\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n" })] }), _jsx(Link, { href: "/rooms", children: _jsx(Button, { children: "\u0110\u1EB7t ph\u00F2ng m\u1EDBi" }) })] }), bookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Calendar, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Ch\u01B0a c\u00F3 \u0111\u1EB7t ph\u00F2ng n\u00E0o" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "B\u1EA1n ch\u01B0a c\u00F3 \u0111\u1EB7t ph\u00F2ng n\u00E0o. H\u00E3y kh\u00E1m ph\u00E1 c\u00E1c ph\u00F2ng c\u1EE7a ch\u00FAng t\u00F4i!" }), _jsx(Link, { href: "/rooms", children: _jsx(Button, { children: "Kh\u00E1m ph\u00E1 ph\u00F2ng" }) })] }) })) : (_jsx("div", { className: "space-y-4", children: bookings.map((booking) => (_jsx(BookingItem, { booking: booking }, booking.id))) }))] }) }) }));
}
//# sourceMappingURL=page.js.map