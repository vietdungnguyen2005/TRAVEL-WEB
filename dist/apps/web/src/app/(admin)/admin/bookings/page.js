"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar, User, Bed, Phone, Mail, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}
function getStatusColor(status) {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "CONFIRMED":
            return "bg-green-100 text-green-800 border-green-200";
        case "COMPLETED":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "CANCELLED":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
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
function getPaymentStatusText(status) {
    switch (status) {
        case "PENDING":
            return "Chờ thanh toán";
        case "PAID":
            return "Đã thanh toán";
        case "FAILED":
            return "Thất bại";
        case "REFUNDED":
            return "Đã hoàn tiền";
        default:
            return status;
    }
}
export default function BookingsManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [updating, setUpdating] = useState(null);
    useEffect(() => {
        fetchBookings();
    }, [filter]);
    async function fetchBookings() {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter !== "ALL") {
                params.append("status", filter);
            }
            const response = await fetch(`/api/admin/bookings?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
        }
        finally {
            setLoading(false);
        }
    }
    async function updateBookingStatus(bookingId, newStatus) {
        try {
            setUpdating(bookingId);
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                await fetchBookings();
            }
            else {
                alert("Không thể cập nhật trạng thái");
            }
        }
        catch (error) {
            console.error("Error updating status:", error);
            alert("Đã xảy ra lỗi");
        }
        finally {
            setUpdating(null);
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Qu\u1EA3n l\u00FD \u0111\u1EB7t ph\u00F2ng" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Xem v\u00E0 qu\u1EA3n l\u00FD t\u1EA5t c\u1EA3 \u0111\u1EB7t ph\u00F2ng trong h\u1EC7 th\u1ED1ng" })] }), _jsxs(Select, { value: filter, onValueChange: setFilter, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\u00E1i" }), _jsx(SelectItem, { value: "PENDING", children: "Ch\u1EDD x\u00E1c nh\u1EADn" }), _jsx(SelectItem, { value: "CONFIRMED", children: "\u0110\u00E3 x\u00E1c nh\u1EADn" }), _jsx(SelectItem, { value: "COMPLETED", children: "Ho\u00E0n th\u00E0nh" }), _jsx(SelectItem, { value: "CANCELLED", children: "\u0110\u00E3 h\u1EE7y" })] })] })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] })) : bookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng c\u00F3 \u0111\u1EB7t ph\u00F2ng n\u00E0o" })] }) })) : (_jsx("div", { className: "grid gap-6", children: bookings.map((booking) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs(CardTitle, { className: "text-lg", children: ["M\u00E3 \u0111\u1EB7t ph\u00F2ng: #", booking.id.slice(0, 8).toUpperCase()] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u0110\u1EB7t ng\u00E0y: ", format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsx(Badge, { className: getStatusColor(booking.status), children: getStatusText(booking.status) }), _jsx(Badge, { variant: "outline", children: getPaymentStatusText(booking.paymentStatus) })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4" }), "Th\u00F4ng tin kh\u00E1ch h\u00E0ng"] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500", children: "T\u00EAn:" }), _jsx("span", { className: "font-medium", children: booking.user.name || "Chưa cập nhật" })] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { children: booking.user.email })] }), booking.user.phone && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { children: booking.user.phone })] }))] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Bed, { className: "w-4 h-4" }), "Th\u00F4ng tin \u0111\u1EB7t ph\u00F2ng"] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500", children: "Ph\u00F2ng:" }), _jsxs("span", { className: "font-medium", children: [booking.room.roomType.name, " - Ph\u00F2ng ", booking.room.roomNumber] })] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: [format(new Date(booking.checkInDate), "dd/MM/yyyy"), " -", " ", format(new Date(booking.checkOutDate), "dd/MM/yyyy")] })] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: [booking.numberOfGuests, " kh\u00E1ch"] })] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-semibold text-lg", children: formatCurrency(Number(booking.totalPrice)) })] }), booking.specialRequests && (_jsxs("p", { className: "text-gray-600 mt-2", children: [_jsx("span", { className: "font-medium", children: "Y\u00EAu c\u1EA7u \u0111\u1EB7c bi\u1EC7t:" }), " ", booking.specialRequests] }))] })] })] }), booking.status === "PENDING" && (_jsxs("div", { className: "flex gap-3 mt-6 pt-6 border-t", children: [_jsx(Button, { onClick: () => updateBookingStatus(booking.id, "CONFIRMED"), disabled: updating === booking.id, className: "bg-green-600 hover:bg-green-700", children: updating === booking.id ? "Đang xử lý..." : "Xác nhận đặt phòng" }), _jsx(Button, { variant: "destructive", onClick: () => updateBookingStatus(booking.id, "CANCELLED"), disabled: updating === booking.id, children: "H\u1EE7y \u0111\u1EB7t ph\u00F2ng" })] })), booking.status === "CONFIRMED" && (_jsx("div", { className: "flex gap-3 mt-6 pt-6 border-t", children: _jsx(Button, { onClick: () => updateBookingStatus(booking.id, "COMPLETED"), disabled: updating === booking.id, children: updating === booking.id ? "Đang xử lý..." : "Đánh dấu hoàn thành" }) }))] })] }, booking.id))) }))] }));
}
//# sourceMappingURL=page.js.map