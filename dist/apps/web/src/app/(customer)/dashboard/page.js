"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Users, Clock, XCircle, CheckCircle, Loader2, AlertTriangle, Download, Home, } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";
export default function DashboardPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    useEffect(() => {
        fetchBookings();
    }, []);
    const fetchBookings = async () => {
        try {
            const response = await gatewayFetch("/api/bookings/my-bookings", {
                method: "GET",
                attachAccessToken: true,
            });
            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/auth/login?redirect=/dashboard");
                    return;
                }
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            setBookings(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancelBooking = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?"))
            return;
        setCancellingId(bookingId);
        try {
            const response = await gatewayFetch(`/api/bookings/${bookingId}/cancel`, {
                method: "POST",
                attachAccessToken: true,
            });
            if (!response.ok) {
                throw new Error("Failed to cancel booking");
            }
            await fetchBookings();
            alert("Booking cancelled successfully");
        }
        catch (err) {
            alert(err.message);
        }
        finally {
            setCancellingId(null);
        }
    };
    const calculateNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-500";
            case "PENDING":
                return "bg-yellow-500";
            case "CANCELLED":
                return "bg-red-500";
            case "COMPLETED":
                return "bg-blue-500";
            case "ON_HOLD":
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "CONFIRMED":
            case "COMPLETED":
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case "CANCELLED":
                return _jsx(XCircle, { className: "h-4 w-4" });
            case "ON_HOLD":
            case "PENDING":
                return _jsx(Clock, { className: "h-4 w-4" });
            default:
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
        }
    };
    const upcomingBookings = bookings.filter((b) => (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.checkIn) > new Date());
    const pastBookings = bookings.filter((b) => b.status === "COMPLETED" ||
        (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date()));
    const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");
    const BookingCard = ({ booking }) => {
        const nights = calculateNights(booking.checkIn, booking.checkOut);
        const canCancel = booking.status === "CONFIRMED" &&
            new Date(booking.checkIn) > new Date(Date.now() + 24 * 60 * 60 * 1000);
        return (_jsx(Card, { className: "overflow-hidden", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "relative h-48 md:h-full", children: booking.room.roomType.images[0] && (_jsx(Image, { src: booking.room.roomType.images[0], alt: booking.room.roomType.name, fill: true, className: "object-cover" })) }), _jsxs("div", { className: "col-span-2 p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-1", children: booking.room.roomType.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Room ", booking.room.roomNumber] })] }), _jsx(Badge, { className: `${getStatusColor(booking.status)} text-white`, children: _jsxs("span", { className: "flex items-center gap-1", children: [getStatusIcon(booking.status), booking.status] }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 mt-1 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Check-in" }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(booking.checkIn), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 mt-1 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Check-out" }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(booking.checkOut), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Home, { className: "h-4 w-4 mt-1 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Duration" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [nights, " ", nights === 1 ? "night" : "nights"] })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Users, { className: "h-4 w-4 mt-1 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Guests" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [booking.numberOfGuests, " ", booking.numberOfGuests === 1 ? "guest" : "guests"] })] })] })] }), _jsx(Separator, { className: "my-4" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Price" }), _jsxs("p", { className: "text-2xl font-bold", children: [Number(booking.totalPrice).toLocaleString("vi-VN"), " VND"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Payment: ", booking.paymentStatus, " (", booking.paymentMethod, ")"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { href: `/booking/success/${booking.id}`, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "View Details"] }) }), canCancel && (_jsx(Button, { variant: "destructive", size: "sm", onClick: () => handleCancelBooking(booking.id), disabled: cancellingId === booking.id, children: cancellingId === booking.id ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Cancelling..."] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-4 w-4 mr-2" }), "Cancel"] })) }))] })] })] })] }) }));
    };
    if (loading) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsx("div", { className: "flex items-center justify-center", children: _jsx(Loader2, { className: "h-12 w-12 animate-spin text-primary" }) }) }) }));
    }
    return (_jsx(ClientLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "My Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Manage your bookings and account settings" })] }), error && (_jsxs(Alert, { variant: "destructive", className: "mb-6", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), _jsxs(Tabs, { defaultValue: "upcoming", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-3", children: [_jsxs(TabsTrigger, { value: "upcoming", children: ["Upcoming (", upcomingBookings.length, ")"] }), _jsxs(TabsTrigger, { value: "past", children: ["Past (", pastBookings.length, ")"] }), _jsxs(TabsTrigger, { value: "cancelled", children: ["Cancelled (", cancelledBookings.length, ")"] })] }), _jsx(TabsContent, { value: "upcoming", className: "space-y-4", children: upcomingBookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16", children: [_jsx(Calendar, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No Upcoming Bookings" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Start planning your next stay" }), _jsx(Link, { href: "/rooms", children: _jsx(Button, { children: "Browse Rooms" }) })] }) })) : (upcomingBookings.map((booking) => (_jsx(BookingCard, { booking: booking }, booking.id)))) }), _jsx(TabsContent, { value: "past", className: "space-y-4", children: pastBookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16", children: [_jsx(Clock, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No Past Bookings" }), _jsx("p", { className: "text-muted-foreground", children: "Your booking history will appear here" })] }) })) : (pastBookings.map((booking) => (_jsx(BookingCard, { booking: booking }, booking.id)))) }), _jsx(TabsContent, { value: "cancelled", className: "space-y-4", children: cancelledBookings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16", children: [_jsx(CheckCircle, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No Cancelled Bookings" }), _jsx("p", { className: "text-muted-foreground", children: "You have not cancelled any bookings" })] }) })) : (cancelledBookings.map((booking) => (_jsx(BookingCard, { booking: booking }, booking.id)))) })] })] }) }));
}
//# sourceMappingURL=page.js.map