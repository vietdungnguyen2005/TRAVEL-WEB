"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Calendar, Users, Clock, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export function BookingItem({ booking }) {
    const [paying, setPaying] = useState(false);
    const numberOfNights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-500";
            case "ON_HOLD":
                return "bg-yellow-500";
            case "CANCELLED":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case "CONFIRMED":
                return "Đã xác nhận";
            case "ON_HOLD":
                return "Chờ thanh toán";
            case "CANCELLED":
                return "Đã hủy";
            case "PENDING":
                return "Đang xử lý";
            default:
                return status;
        }
    };
    const handlePayment = async () => {
        setPaying(true);
        try {
            const response = await gatewayFetch("/api/payment/create-checkout", {
                method: "POST",
                body: JSON.stringify({ bookingId: booking.id }),
                attachAccessToken: true,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Payment failed");
            }
            const data = await response.json();
            window.location.href = data.url;
        }
        catch (error) {
            toast.error("Thanh toán thất bại", {
                description: error.message,
            });
            setPaying(false);
        }
    };
    return (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold", children: booking.room.roomType.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["M\u00E3 \u0111\u1EB7t ph\u00F2ng: ", booking.id.slice(0, 8).toUpperCase()] })] }), _jsx(Badge, { className: getStatusColor(booking.status), children: getStatusText(booking.status) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: ["Nh\u1EADn ph\u00F2ng: ", format(new Date(booking.checkIn), "dd/MM/yyyy")] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: ["Tr\u1EA3 ph\u00F2ng: ", format(new Date(booking.checkOut), "dd/MM/yyyy")] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: [booking.numberOfGuests, " kh\u00E1ch"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: [numberOfNights, " \u0111\u00EAm"] })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n" }), _jsxs("p", { className: "text-xl font-bold", children: [Number(booking.totalPrice).toLocaleString("vi-VN"), "\u0111"] })] }), _jsxs("div", { className: "flex gap-2", children: [booking.status === "ON_HOLD" && (_jsx(Button, { onClick: handlePayment, disabled: paying, children: paying ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "mr-2 h-4 w-4" }), "Thanh to\u00E1n ngay"] })) })), _jsx(Link, { href: `/booking/success/${booking.id}`, children: _jsx(Button, { variant: "outline", children: "Xem chi ti\u1EBFt" }) }), booking.status === "CONFIRMED" && (_jsx(CancelBookingButton, { bookingId: booking.id, roomName: booking.room.roomType.name }))] })] })] }) }));
}
//# sourceMappingURL=booking-item.js.map