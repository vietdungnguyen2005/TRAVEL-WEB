"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Users } from "lucide-react";
export function BookingForm({ roomTypeId, basePrice, capacity, onSubmit, isSubmitting = false }) {
    const [checkIn, setCheckIn] = useState();
    const [checkOut, setCheckOut] = useState();
    const [guests, setGuests] = useState(1);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
    const totalPrice = nights * basePrice;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!checkIn || !checkOut) {
            alert("Please select check-in and check-out dates");
            return;
        }
        onSubmit({
            checkIn,
            checkOut,
            guests,
            guestName,
            guestEmail,
            guestPhone,
        });
    };
    return (_jsxs(Card, { className: "sticky top-20", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Book This Room" }), _jsxs("div", { className: "text-2xl font-bold text-primary", children: [basePrice.toLocaleString("vi-VN"), "d / night"] })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Check-in Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-left font-normal", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), checkIn ? format(checkIn, "PPP") : "Select date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: checkIn, onSelect: setCheckIn, disabled: (date) => date < new Date(), initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Check-out Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-left font-normal", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), checkOut ? format(checkOut, "PPP") : "Select date"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: checkOut, onSelect: setCheckOut, disabled: (date) => !checkIn || date <= checkIn, initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Number of Guests" }), _jsxs(Select, { value: guests.toString(), onValueChange: (v) => setGuests(parseInt(v)), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Array.from({ length: capacity }, (_, i) => i + 1).map((num) => (_jsx(SelectItem, { value: num.toString(), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4" }), num, " ", num === 1 ? "Guest" : "Guests"] }) }, num))) })] })] }), _jsxs("div", { className: "space-y-4 pt-4 border-t", children: [_jsx("h4", { className: "font-semibold", children: "Guest Information" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Full Name *" }), _jsx(Input, { required: true, value: guestName, onChange: (e) => setGuestName(e.target.value), placeholder: "Enter your full name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Email *" }), _jsx(Input, { required: true, type: "email", value: guestEmail, onChange: (e) => setGuestEmail(e.target.value), placeholder: "your@email.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Phone Number *" }), _jsx(Input, { required: true, type: "tel", value: guestPhone, onChange: (e) => setGuestPhone(e.target.value), placeholder: "+84 123 456 789" })] })] }), nights > 0 && (_jsxs("div", { className: "space-y-2 pt-4 border-t", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [basePrice.toLocaleString("vi-VN"), "d x ", nights, " nights"] }), _jsxs("span", { children: [totalPrice.toLocaleString("vi-VN"), "d"] })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "text-primary", children: [totalPrice.toLocaleString("vi-VN"), "d"] })] })] })), _jsx(Button, { type: "submit", className: "w-full", size: "lg", disabled: isSubmitting, children: isSubmitting ? "Checking availability..." : "Reserve Now" }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: "You will not be charged yet. Payment will be processed after confirmation." })] }) })] }));
}
//# sourceMappingURL=booking-form.js.map