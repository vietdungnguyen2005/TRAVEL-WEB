import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./room-card";
export function FeaturedRooms({ rooms }) {
    return (_jsx("section", { className: "py-16 bg-gray-50", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Featured Rooms" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Discover our most popular rooms" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: rooms.map((room) => (_jsx(RoomCard, { room: {
                            ...room,
                            slug: room.slug || '',
                        } }, room.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx(Button, { asChild: true, size: "lg", variant: "outline", children: _jsx(Link, { href: "/rooms", children: "View All Rooms" }) }) })] }) }));
}
//# sourceMappingURL=featured-rooms.js.map