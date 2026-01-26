"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/booking-store";
import { ClientLayout } from "@/components/layout/client-layout";
import { BookingSummary } from "@/components/booking/booking-summary";
import { HoldTimer } from "@/components/booking/hold-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";
export default function BookingConfirmPage() {
    const router = useRouter();
    const bookingData = useBookingStore((state) => state.bookingData);
    const clearBooking = useBookingStore((state) => state.clearBookingData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);
    const [roomAvailable, setRoomAvailable] = useState(false);
    const [assignedRoomId, setAssignedRoomId] = useState(null);
    const [assignedRoomNumber, setAssignedRoomNumber] = useState(null);
    const [holdBookingId, setHoldBookingId] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    useEffect(() => {
        if (!bookingData) {
            router.push("/rooms");
            return;
        }
        checkAvailability();
    }, [bookingData, router]);
    const checkAvailability = async () => {
        if (!bookingData)
            return;
        try {
            setLoading(true);
            setError(null);
            const response = await gatewayFetch("/api/booking/check-availability", {
                method: "POST",
                body: JSON.stringify({
                    roomTypeId: bookingData.roomTypeId,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guests: bookingData.guests,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to check availability");
            }
            setAvailabilityChecked(true);
            setRoomAvailable(data.available);
            if (data.available) {
                setAssignedRoomId(data.roomId);
                setAssignedRoomNumber(data.roomNumber);
                await createHoldBooking(data.roomId);
            }
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const createHoldBooking = async (roomId) => {
        if (!bookingData)
            return;
        try {
            const response = await gatewayFetch("/api/booking/hold", {
                method: "POST",
                body: JSON.stringify({
                    roomId,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guests: bookingData.guests,
                    guestName: bookingData.guestName,
                    guestEmail: bookingData.guestEmail,
                    guestPhone: bookingData.guestPhone,
                    totalPrice: bookingData.totalPrice,
                }),
                attachAccessToken: true,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create hold booking");
            }
            setHoldBookingId(data.booking.id);
            setExpiresAt(new Date(data.booking.expiresAt));
        }
        catch (err) {
            setError(err.message);
        }
    };
    const handleTimerExpire = () => {
        setError("Your reservation has expired. Please start over.");
        setTimeout(() => {
            clearBooking();
            router.push("/rooms");
        }, 3000);
    };
    const handleProceedToPayment = () => {
        setProcessingPayment(true);
        router.push(`/booking/payment/${holdBookingId}`);
    };
    const handleCancel = () => {
        clearBooking();
        router.push("/rooms");
    };
    if (!bookingData) {
        return null;
    }
    const nights = differenceInDays(new Date(bookingData.checkOut), new Date(bookingData.checkIn));
    return (_jsx(ClientLayout, { children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Confirm Your Booking" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [loading && (_jsx(Card, { children: _jsx(CardContent, { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin mx-auto mb-4 text-primary" }), _jsx("p", { className: "text-lg", children: "Checking availability..." })] }) }) })), error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] })), availabilityChecked && !roomAvailable && !loading && (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(AlertTriangle, { className: "h-16 w-16 text-yellow-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold mb-2", children: "Room Not Available" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Sorry, this room is not available for your selected dates." }), _jsx(Button, { onClick: () => router.push("/rooms"), children: "View Other Rooms" })] }) })), availabilityChecked && roomAvailable && !loading && (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }), "Room Reserved"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("p", { children: ["Great news! Room ", _jsx("strong", { children: assignedRoomNumber }), " has been reserved for you."] }), expiresAt && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsx(HoldTimer, { expiresAt: expiresAt, onExpire: handleTimerExpire }) })), _jsx(Alert, { children: _jsx(AlertDescription, { children: "Please complete your payment within the time limit to confirm your booking. Your reservation will be automatically cancelled if payment is not received." }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Payment Options" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleProceedToPayment, disabled: processingPayment, className: "w-full", size: "lg", children: [processingPayment && (_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })), "Proceed to Payment"] }), _jsx(Button, { onClick: handleCancel, variant: "outline", className: "w-full", disabled: processingPayment, children: "Cancel Booking" })] })] })] }))] }), _jsx("div", { className: "lg:col-span-1", children: _jsx(BookingSummary, { roomName: "Room Type", roomImage: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400", checkIn: new Date(bookingData.checkIn), checkOut: new Date(bookingData.checkOut), guests: bookingData.guests, nights: nights, pricePerNight: bookingData.totalPrice / nights, totalPrice: bookingData.totalPrice, guestName: bookingData.guestName, guestEmail: bookingData.guestEmail, guestPhone: bookingData.guestPhone }) })] })] }) }));
}
//# sourceMappingURL=page.js.map