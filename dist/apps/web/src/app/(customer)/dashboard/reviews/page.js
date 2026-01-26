"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/reviews/review-form";
import { Star, Calendar, Home } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";
export default function MyReviewsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    useEffect(() => {
        fetchReviewableBookings();
    }, []);
    async function fetchReviewableBookings() {
        try {
            const response = await gatewayFetch("/api/reviews/my-reviewable", {
                method: "GET",
                attachAccessToken: true,
            });
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login?redirect=/dashboard/reviews");
                    return;
                }
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            setBookings(data);
        }
        catch (error) {
            console.error("Error fetching reviewable bookings:", error);
        }
        finally {
            setLoading(false);
        }
    }
    function handleReviewClick(booking) {
        setSelectedBooking(booking);
        setDialogOpen(true);
    }
    function handleReviewSuccess() {
        setDialogOpen(false);
        setSelectedBooking(null);
        fetchReviewableBookings();
        alert("Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được ghi nhận.");
    }
    if (loading) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i..." })] }) }) }));
    }
    return (_jsx(ClientLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center gap-4 mb-4", children: _jsx(Link, { href: "/dashboard", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Home, { className: "w-4 h-4 mr-2" }), "Dashboard"] }) }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0110\u00E1nh gi\u00E1 c\u1EE7a t\u00F4i" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n v\u1EC1 c\u00E1c ph\u00F2ng \u0111\u00E3 \u1EDF" })] }), bookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Star, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500 mb-2", children: "B\u1EA1n ch\u01B0a c\u00F3 \u0111\u1EB7t ph\u00F2ng n\u00E0o c\u1EA7n \u0111\u00E1nh gi\u00E1" }), _jsx("p", { className: "text-sm text-gray-400", children: "Sau khi ho\u00E0n t\u1EA5t \u0111\u1EB7t ph\u00F2ng, b\u1EA1n c\u00F3 th\u1EC3 quay l\u1EA1i \u0111\u00E2y \u0111\u1EC3 \u0111\u00E1nh gi\u00E1" }), _jsx(Link, { href: "/rooms", children: _jsx(Button, { className: "mt-4", children: "Kh\u00E1m ph\u00E1 ph\u00F2ng" }) })] }) })) : (_jsx("div", { className: "grid gap-6", children: bookings.map((booking) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex gap-6", children: [_jsx("div", { className: "relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden", children: booking.room.roomType.images[0] ? (_jsx(Image, { src: booking.room.roomType.images[0], alt: booking.room.roomType.name, fill: true, className: "object-cover" })) : (_jsx("div", { className: "w-full h-full bg-gray-200 flex items-center justify-center", children: _jsx(Home, { className: "w-8 h-8 text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-semibold mb-2", children: booking.room.roomType.name }), _jsxs("p", { className: "text-sm text-gray-500 mb-4", children: ["Ph\u00F2ng ", booking.room.roomNumber] }), _jsx("div", { className: "flex items-center gap-6 text-sm text-gray-600 mb-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsxs("span", { children: [format(new Date(booking.checkIn), "dd/MM/yyyy", {
                                                                    locale: vi,
                                                                }), " ", "-", " ", format(new Date(booking.checkOut), "dd/MM/yyyy", {
                                                                    locale: vi,
                                                                })] })] }) }), _jsxs(Button, { onClick: () => handleReviewClick(booking), className: "gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), "Vi\u1EBFt \u0111\u00E1nh gi\u00E1"] })] })] }) }) }, booking.id))) })), _jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n" }), _jsx(DialogDescription, { children: "Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n \u0111\u1EC3 gi\u00FAp kh\u00E1ch h\u00E0ng kh\u00E1c" })] }), selectedBooking && (_jsx(ReviewForm, { bookingId: selectedBooking.id, roomTypeName: selectedBooking.room.roomType.name, onSuccess: handleReviewSuccess }))] }) })] }) }));
}
//# sourceMappingURL=page.js.map