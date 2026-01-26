"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
export function ReviewsList({ roomTypeId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    useEffect(() => {
        fetchReviews();
    }, [roomTypeId, page]);
    async function fetchReviews() {
        try {
            setLoading(true);
            const response = await fetch(`/api/reviews/room-type/${roomTypeId}?page=${page}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews);
                setStats(data.stats);
                setHasMore(data.pagination.page < data.pagination.totalPages);
            }
        }
        catch (error) {
            console.error("Error fetching reviews:", error);
        }
        finally {
            setLoading(false);
        }
    }
    function renderStars(rating) {
        return (_jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-4 h-4 ${star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"}` }, star))) }));
    }
    if (loading && page === 1) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i \u0111\u00E1nh gi\u00E1..." })] }));
    }
    if (!stats || stats.totalReviews === 0) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Star, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Ch\u01B0a c\u00F3 \u0111\u00E1nh gi\u00E1 n\u00E0o" }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "H\u00E3y l\u00E0 ng\u01B0\u1EDDi \u0111\u1EA7u ti\u00EAn \u0111\u00E1nh gi\u00E1 ph\u00F2ng n\u00E0y" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-5xl font-bold text-gray-900 mb-2", children: stats.averageRating.toFixed(1) }), renderStars(Math.round(stats.averageRating)), _jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [stats.totalReviews, " \u0111\u00E1nh gi\u00E1"] })] }), _jsx("div", { className: "space-y-2", children: stats.distribution.map((item) => {
                                    const percentage = stats.totalReviews > 0
                                        ? (item.count / stats.totalReviews) * 100
                                        : 0;
                                    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-gray-600 w-12", children: [item.rating, " sao"] }), _jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-yellow-400 h-2 rounded-full transition-all", style: { width: `${percentage}%` } }) }), _jsx("span", { className: "text-sm text-gray-500 w-12 text-right", children: item.count })] }, item.rating));
                                }) })] }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u0110\u00E1nh gi\u00E1 t\u1EEB kh\u00E1ch h\u00E0ng" }), reviews.map((review) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: review.user.image ||
                                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}` }), _jsx(AvatarFallback, { children: review.user.name?.[0]?.toUpperCase() || "U" })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: review.user.name || "Khách hàng" }), _jsx("p", { className: "text-sm text-gray-500", children: format(new Date(review.createdAt), "dd/MM/yyyy", {
                                                                    locale: vi,
                                                                }) })] }), renderStars(review.rating)] }), review.comment && (_jsx("p", { className: "text-gray-700 mt-2", children: review.comment }))] })] }) }) }, review.id)))] }), hasMore && (_jsx("div", { className: "text-center", children: _jsx("button", { onClick: () => setPage(page + 1), disabled: loading, className: "text-blue-600 hover:text-blue-700 font-medium", children: loading ? "Đang tải..." : "Xem thêm đánh giá" }) }))] }));
}
//# sourceMappingURL=reviews-list.js.map