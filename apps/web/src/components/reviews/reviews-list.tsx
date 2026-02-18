"use client";

import { useState, useEffect } from "react";
import { gatewayFetch } from "@/lib/gateway-client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    rating: number;
    count: number;
  }[];
}

interface ReviewsListProps {
  roomTypeId: string;
}

export function ReviewsList({ roomTypeId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await gatewayFetch(
          `/api/reviews/room-type/${roomTypeId}?page=${page}&limit=10`,
          { method: "GET" }
        );

        if (!response.ok) return;

        const data = await response.json();
        if (cancelled) return;

        setReviews(data.reviews);
        setStats(data.stats);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomTypeId, page]);

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  }

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có đánh giá nào</p>
          <p className="text-sm text-gray-400 mt-2">
            Hãy là người đầu tiên đánh giá phòng này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalReviews} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {stats.distribution.map((item) => {
                const percentage =
                  stats.totalReviews > 0
                    ? (item.count / stats.totalReviews) * 100
                    : 0;
                return (
                  <div key={item.rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12">
                      {item.rating} sao
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Đánh giá từ khách hàng
        </h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage
                    src={
                      review.user.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`
                    }
                  />
                  <AvatarFallback>
                    {review.user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.user.name || "Khách hàng"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(page + 1)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {loading ? "Đang tải..." : "Xem thêm đánh giá"}
          </button>
        </div>
      )}
    </div>
  );
}
