"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
export function CancelBookingButton({ bookingId, roomName }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const handleCancel = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: "POST",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Không thể hủy đặt phòng");
            }
            toast.success("Hủy đặt phòng thành công!", {
                description: `Đặt phòng ${roomName} đã được hủy`
            });
            router.refresh();
        }
        catch (error) {
            toast.error("Hủy đặt phòng thất bại", {
                description: error.message || "Vui lòng thử lại sau"
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { variant: "destructive", disabled: loading, children: loading ? "Đang xử lý..." : "Hủy đặt phòng" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "X\u00E1c nh\u1EADn h\u1EE7y \u0111\u1EB7t ph\u00F2ng" }), _jsxs(AlertDialogDescription, { children: ["B\u1EA1n c\u00F3 ch\u1EAFc ch\u1EAFn mu\u1ED1n h\u1EE7y \u0111\u1EB7t ph\u00F2ng ", _jsx("strong", { children: roomName }), "?", _jsx("br", {}), _jsx("br", {}), "H\u00E0nh \u0111\u1ED9ng n\u00E0y kh\u00F4ng th\u1EC3 ho\u00E0n t\u00E1c. Vui l\u00F2ng ki\u1EC3m tra ch\u00EDnh s\u00E1ch h\u1EE7y ph\u00F2ng tr\u01B0\u1EDBc khi x\u00E1c nh\u1EADn."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Quay l\u1EA1i" }), _jsx(AlertDialogAction, { onClick: handleCancel, className: "bg-destructive hover:bg-destructive/90", children: "X\u00E1c nh\u1EADn h\u1EE7y" })] })] })] }));
}
//# sourceMappingURL=cancel-booking-button.js.map