"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, Calendar, Users, Home, Mail, Phone, User, Download, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
export default function BookingSuccessPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchBooking();
    }, [id]);
    const fetchBooking = async () => {
        try {
            const response = await fetch(`/api/booking/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch booking");
            }
            const data = await response.json();
            setBooking(data);
        }
        catch (error) {
            console.error("Error fetching booking:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const calculateNights = () => {
        if (!booking)
            return 0;
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    };
    const handlePrint = () => {
        window.print();
    };
    if (loading) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsx(Card, { children: _jsx(CardContent, { className: "flex items-center justify-center py-16", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin mx-auto mb-4 text-primary" }), _jsx("p", { className: "text-lg", children: "Loading booking details..." })] }) }) }) }) }));
    }
    if (!booking) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsx(Card, { children: _jsxs(CardContent, { className: "py-16 text-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Booking Not Found" }), _jsx(Button, { onClick: () => router.push("/rooms"), children: "Browse Rooms" })] }) }) }) }));
    }
    const nights = calculateNights();
    const pricePerNight = Number(booking.room.roomType.pricePerNight);
    return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4", children: _jsx(CheckCircle2, { className: "h-10 w-10 text-green-600" }) }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "Booking Confirmed!" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Your reservation has been successfully confirmed" })] }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "bg-primary/5", children: _jsx(CardTitle, { children: "Booking Details" }) }), _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [booking.room.roomType.images[0] && (_jsx("div", { className: "relative h-48 rounded-lg overflow-hidden mb-4", children: _jsx(Image, { src: booking.room.roomType.images[0], alt: booking.room.roomType.name, fill: true, className: "object-cover" }) })), _jsx("h3", { className: "font-semibold text-xl mb-1", children: booking.room.roomType.name }), _jsxs("p", { className: "text-muted-foreground mb-4", children: ["Room ", booking.room.roomNumber] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-muted-foreground", children: "Booking ID" }), _jsx("span", { className: "font-mono font-semibold", children: booking.id.slice(0, 8) })] }), _jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-muted-foreground", children: "Status" }), _jsx("span", { className: "font-semibold text-green-600", children: booking.status })] }), _jsxs("div", { className: "flex justify-between py-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Payment Status" }), _jsx("span", { className: "font-semibold", children: booking.paymentStatus })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Stay Details" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-muted-foreground mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Check-in" }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(booking.checkIn), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-muted-foreground mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Check-out" }), _jsx("p", { className: "text-sm text-muted-foreground", children: format(new Date(booking.checkOut), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Home, { className: "h-5 w-5 text-muted-foreground mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Duration" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [nights, " ", nights === 1 ? "night" : "nights"] })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "h-5 w-5 text-muted-foreground mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Guests" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [booking.numberOfGuests, " ", booking.numberOfGuests === 1 ? "guest" : "guests"] })] })] })] })] }), booking.guestName && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Guest Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: booking.guestName })] }), booking.guestEmail && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: booking.guestEmail })] })), booking.guestPhone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: booking.guestPhone })] }))] })] }))] })] }), _jsx(Separator, { className: "my-6" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [pricePerNight.toLocaleString("vi-VN"), " VND x ", nights, " nights"] }), _jsxs("span", { children: [(pricePerNight * nights).toLocaleString("vi-VN"), " VND"] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-bold text-xl", children: [_jsx("span", { children: "Total Paid" }), _jsxs("span", { className: "text-green-600", children: [Number(booking.totalPrice).toLocaleString("vi-VN"), " VND"] })] })] })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Important Information" }), _jsxs("ul", { className: "text-sm space-y-1 list-disc list-inside text-muted-foreground", children: [_jsx("li", { children: "Check-in time: 2:00 PM" }), _jsx("li", { children: "Check-out time: 12:00 PM" }), _jsx("li", { children: "Please bring a valid ID for check-in" }), _jsx("li", { children: "Confirmation email has been sent to your email address" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs(Button, { onClick: handlePrint, variant: "outline", className: "flex-1", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Confirmation"] }), _jsx(Link, { href: "/rooms", className: "flex-1", children: _jsxs(Button, { className: "w-full", children: ["Browse More Rooms", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] })] }) }) }));
}
//# sourceMappingURL=page.js.map