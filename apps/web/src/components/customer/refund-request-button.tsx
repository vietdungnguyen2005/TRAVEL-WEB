"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { gatewayFetch } from "@/lib/gateway-client";

export function RefundRequestButton({
    bookingId,
    paymentStatus,
    bookingStatus,
    checkOut,
}: {
    bookingId: string;
    paymentStatus: string;
    bookingStatus?: string;
    checkOut?: string;
}) {
    const [loading, setLoading] = useState(false);

    // Don't show refund button for completed or past bookings
    const isPast = bookingStatus === "COMPLETED" || (checkOut && new Date(checkOut) < new Date());
    const eligible = paymentStatus === "PAID" && !isPast;
    const alreadyRequested = paymentStatus === "REFUND_REQUESTED";

    if (!eligible && !alreadyRequested) return null;

    async function onClick() {
        if (!eligible) return;
        const ok = confirm("Bạn muốn gửi yêu cầu huỷ thanh toán (chờ admin duyệt)?");
        if (!ok) return;

        try {
            setLoading(true);
            const res = await gatewayFetch("/api/payments/refund-request", {
                method: "POST",
                body: JSON.stringify({ bookingId }),
                attachAccessToken: true,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Refund request failed");
            }

            alert("Đã gửi yêu cầu hoàn tiền. Vui lòng chờ admin duyệt.");
            // page uses its own fetch; simplest is a full refresh
            window.location.reload();
        } catch (e: any) {
            alert(e?.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    }

    if (alreadyRequested) {
        return (
            <Button variant="outline" size="sm" disabled>
                Đã yêu cầu hoàn tiền
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={onClick}
        >
            {loading ? "Đang gửi..." : "Yêu cầu huỷ thanh toán"}
        </Button>
    );
}
