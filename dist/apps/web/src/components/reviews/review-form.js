"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";
export function ReviewForm({ bookingId, roomTypeName, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    async function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const response = await gatewayFetch("/api/reviews", {
                method: "POST",
                body: JSON.stringify({
                    bookingId,
                    rating,
                    comment: comment.trim() || null,
                }),
                attachAccessToken: true,
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Không thể gửi đánh giá");
            }
            setRating(0);
            setComment("");
            onSuccess?.();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: ["\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n v\u1EC1 ", roomTypeName] }), _jsxs("div", { className: "flex items-center gap-2", children: [[1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoveredRating(star), onMouseLeave: () => setHoveredRating(0), className: "transition-transform hover:scale-110", children: _jsx(Star, { className: `w-8 h-8 ${star <= (hoveredRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"}` }) }, star))), rating > 0 && (_jsxs("span", { className: "text-sm text-gray-600 ml-2", children: [rating === 1 && "Rất tệ", rating === 2 && "Tệ", rating === 3 && "Bình thường", rating === 4 && "Tốt", rating === 5 && "Xuất sắc"] }))] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "comment", className: "text-sm font-medium text-gray-700 mb-2 block", children: "Nh\u1EADn x\u00E9t (kh\u00F4ng b\u1EAFt bu\u1ED9c)" }), _jsx(Textarea, { id: "comment", value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n v\u1EC1 ph\u00F2ng...", rows: 4, maxLength: 500 }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [comment.length, "/500 k\u00FD t\u1EF1"] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error })), _jsx(Button, { type: "submit", disabled: submitting, className: "w-full", children: submitting ? "Đang gửi..." : "Gửi đánh giá" })] }));
}
//# sourceMappingURL=review-form.js.map