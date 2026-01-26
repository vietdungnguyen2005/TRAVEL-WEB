"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, ShieldCheck, CheckCircle2, XCircle, Calendar, Users, Home, Clock } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch, gatewayUrl } from "@/lib/gateway-client";
export default function PaymentPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    useEffect(() => {
        fetchBooking();
    }, [id]);
    useEffect(() => {
        if (!booking?.holdExpiresAt)
            return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expires = new Date(booking.holdExpiresAt).getTime();
            const remaining = expires - now;
            if (remaining <= 0) {
                setError("Booking hold has expired. Please start over.");
                clearInterval(interval);
                setTimeout(() => {
                    router.push("/rooms");
                }, 3000);
            }
            else {
                setTimeRemaining(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [booking?.holdExpiresAt, router]);
    const fetchBooking = async () => {
        try {
            const response = await fetch(gatewayUrl(`/api/booking/${encodeURIComponent(id)}`));
            if (!response.ok) {
                throw new Error("Failed to fetch booking");
            }
            const data = await response.json();
            if (data.status !== "ON_HOLD") {
                setError("This booking is no longer available for payment");
                return;
            }
            setBooking(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleStripePayment = async () => {
        if (!booking)
            return;
        setProcessing(true);
        setError(null);
        try {
            const response = await gatewayFetch("/api/payment/create-checkout", {
                method: "POST",
                body: JSON.stringify({
                    bookingId: booking.id,
                }),
                attachAccessToken: true,
            });
            if (!response.ok) {
                throw new Error("Failed to create checkout session");
            }
            const { url } = await response.json();
            window.location.href = url;
        }
        catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };
    const handleDirectPayment = async () => {
        if (!booking)
            return;
        setProcessing(true);
        setError(null);
        try {
            const response = await gatewayFetch("/api/payment/confirm", {
                method: "POST",
                body: JSON.stringify({
                    bookingId: booking.id,
                    paymentMethod: "CASH",
                }),
                attachAccessToken: true,
            });
            if (!response.ok) {
                throw new Error("Payment confirmation failed");
            }
            router.push(`/booking/success/${booking.id}`);
        }
        catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };
    const formatTimeRemaining = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    const calculateNights = () => {
        if (!booking)
            return 0;
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    };
    if (loading) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsx(Card, { children: _jsx(CardContent, { className: "flex items-center justify-center py-16", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin mx-auto mb-4 text-primary" }), _jsx("p", { className: "text-lg", children: "Loading payment information..." })] }) }) }) }) }));
    }
    if (error && !booking) {
        return (_jsx(ClientLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-16", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { onClick: () => router.push("/rooms"), children: "Back to Rooms" }) })] }) }));
    }
    if (!booking)
        return null;
    const nights = calculateNights();
    const pricePerNight = Number(booking.room.roomType.pricePerNight);
    return (_jsx(ClientLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Complete Payment" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), timeRemaining > 0 && (_jsx(Card, { className: timeRemaining < 300000 ? "border-red-500" : "", children: _jsx(CardContent, { className: "py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: `h-5 w-5 ${timeRemaining < 300000 ? "text-red-500" : ""}` }), _jsx("span", { className: "font-medium", children: "Time remaining to complete payment:" })] }), _jsx("span", { className: `text-2xl font-bold ${timeRemaining < 300000 ? "text-red-500" : ""}`, children: formatTimeRemaining(timeRemaining) })] }) }) })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CreditCard, { className: "h-5 w-5" }), "Payment Methods"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Button, { onClick: handleStripePayment, disabled: processing, className: "w-full h-16 text-lg", size: "lg", children: processing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-5 w-5 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "mr-2 h-5 w-5" }), "Pay with Card (Stripe)"] })) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or" }) })] }), _jsxs(Button, { onClick: handleDirectPayment, disabled: processing, variant: "outline", className: "w-full h-16 text-lg", size: "lg", children: [_jsx(CheckCircle2, { className: "mr-2 h-5 w-5" }), "Pay at Hotel (Cash/Card)"] }), _jsxs("div", { className: "flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md", children: [_jsx(ShieldCheck, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }), _jsx("p", { children: "Your payment is secure. We use industry-standard encryption to protect your information." })] })] })] })] }), _jsx("div", { children: _jsxs(Card, { className: "sticky top-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Booking Summary" }) }), _jsxs(CardContent, { className: "space-y-4", children: [booking.room.roomType.images[0] && (_jsx("div", { className: "relative h-48 rounded-lg overflow-hidden", children: _jsx(Image, { src: booking.room.roomType.images[0], alt: booking.room.roomType.name, fill: true, className: "object-cover" }) })), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: booking.room.roomType.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Room ", booking.room.roomNumber] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 mt-0.5 text-muted-foreground" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Check-in" }), _jsx("p", { className: "text-muted-foreground", children: format(new Date(booking.checkIn), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 mt-0.5 text-muted-foreground" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Check-out" }), _jsx("p", { className: "text-muted-foreground", children: format(new Date(booking.checkOut), "PPP") })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Users, { className: "h-4 w-4 mt-0.5 text-muted-foreground" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Guests" }), _jsxs("p", { className: "text-muted-foreground", children: [booking.numberOfGuests, " ", booking.numberOfGuests === 1 ? "guest" : "guests"] })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Home, { className: "h-4 w-4 mt-0.5 text-muted-foreground" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: "Nights" }), _jsxs("p", { className: "text-muted-foreground", children: [nights, " nights"] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [pricePerNight.toLocaleString("vi-VN"), " VND x ", nights, " nights"] }), _jsxs("span", { children: [(pricePerNight * nights).toLocaleString("vi-VN"), " VND"] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: [Number(booking.totalPrice).toLocaleString("vi-VN"), " VND"] })] })] })] })] }) })] })] }) }));
}
//# sourceMappingURL=page.js.map