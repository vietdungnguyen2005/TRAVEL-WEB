"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";

interface ReviewFormProps {
  bookingId: string;
  roomTypeId?: string;
  roomId?: string;
  roomTypeName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, roomTypeId, roomId, roomTypeName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          roomTypeId: roomTypeId || roomId,
          rating,
          comment: comment.trim() || null,
        }),
        attachAccessToken: true,
      });

      if (!response.ok) {
        let errorMessage = "Không thể gửi đánh giá";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Response body is not valid JSON
        }
        throw new Error(errorMessage);
      }

      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Đánh giá của bạn về {roomTypeName}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                  }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Xuất sắc"}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-2 block">
          Nhận xét (không bắt buộc)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về phòng..."
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/2000 ký tự
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}
