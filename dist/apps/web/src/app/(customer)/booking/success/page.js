"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Home, Calendar } from "lucide-react";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";
export default function BookingSuccessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    useEffect(() => {
        // Read search params on client runtime to avoid using useSearchParams during prerender.
        const sp = new URLSearchParams(window.location.search);
        const id = sp.get("session_id");
        setSessionId(id);
        if (id)
            verifyPayment(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const verifyPayment = async (id) => {
        try {
            const response = await gatewayFetch("/api/payment/verify", {
                method: "POST",
                body: JSON.stringify({ sessionId: id ?? sessionId }),
                attachAccessToken: true,
            });
            if (response.ok) {
                const data = await response.json();
                setBookingDetails(data.booking);
            }
        }
        catch (error) {
            console.error("Verify payment error:", error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [_jsx(Loader2, { className: "h-16 w-16 animate-spin mx-auto text-primary" }), _jsx("p", { className: "mt-4 text-lg text-muted-foreground", children: "\u0110ang x\u00E1c nh\u1EADn thanh to\u00E1n..." })] }) }) }));
    }
    return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-16", children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs(Card, { className: "border-green-200 bg-green-50/50", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100", children: _jsx(CheckCircle, { className: "h-10 w-10 text-green-600" }) }), _jsx(CardTitle, { className: "text-2xl text-green-900", children: "Thanh to\u00E1n th\u00E0nh c\u00F4ng!" }), _jsx(CardDescription, { className: "text-green-700", children: "\u0110\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c x\u00E1c nh\u1EADn" })] }), _jsxs(CardContent, { className: "space-y-6", children: [bookingDetails && (_jsxs("div", { className: "rounded-lg bg-white p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "M\u00E3 \u0111\u1EB7t ph\u00F2ng" }), _jsx("p", { className: "text-lg font-semibold", children: bookingDetails.id })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n" }), _jsxs("p", { className: "text-lg font-semibold text-green-600", children: [Number(bookingDetails.totalPrice).toLocaleString("vi-VN"), "\u0111"] })] })] }), _jsx("div", { className: "h-px bg-gray-200" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Lo\u1EA1i ph\u00F2ng" }), _jsx("p", { className: "font-medium", children: bookingDetails.room?.roomType?.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "S\u1ED1 ph\u00F2ng" }), _jsxs("p", { className: "font-medium", children: ["Ph\u00F2ng ", bookingDetails.room?.roomNumber] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Nh\u1EADn ph\u00F2ng" }), _jsx("p", { className: "font-medium", children: new Date(bookingDetails.checkIn).toLocaleDateString("vi-VN") })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Tr\u1EA3 ph\u00F2ng" }), _jsx("p", { className: "font-medium", children: new Date(bookingDetails.checkOut).toLocaleDateString("vi-VN") })] })] })] })), _jsxs("div", { className: "rounded-lg bg-blue-50 p-4 space-y-2", children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: "\uD83D\uDCE7 Email x\u00E1c nh\u1EADn" }), _jsx("p", { className: "text-sm text-blue-700", children: "Ch\u00FAng t\u00F4i \u0111\u00E3 g\u1EEDi email x\u00E1c nh\u1EADn \u0111\u1EB7t ph\u00F2ng \u0111\u1EBFn \u0111\u1ECBa ch\u1EC9 c\u1EE7a b\u1EA1n. Vui l\u00F2ng ki\u1EC3m tra h\u1ED9p th\u01B0 (bao g\u1ED3m c\u1EA3 th\u01B0 spam)." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: () => router.push("/dashboard/bookings"), className: "flex-1", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Xem \u0111\u1EB7t ph\u00F2ng"] }), _jsxs(Button, { variant: "outline", onClick: () => router.push("/"), className: "flex-1", children: [_jsx(Home, { className: "mr-2 h-4 w-4" }), "V\u1EC1 trang ch\u1EE7"] })] })] })] }) }) }) }));
}
//# sourceMappingURL=page.js.map