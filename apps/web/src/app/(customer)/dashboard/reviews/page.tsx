"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "@/components/reviews/review-form";
import { Star, Calendar, Home, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { gatewayFetch } from "@/lib/gateway-client";

interface ReviewableBooking {
  id: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  room?: {
    roomNumber: string;
    roomType: {
      id: string;
      name: string;
      images: string[];
    };
  };
}

interface ExistingReview {
  id: string;
  bookingId: string;
  roomTypeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ReviewableBooking[]>([]);
  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ReviewableBooking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch bookings and existing reviews in parallel
      const [bookingsRes, reviewsRes] = await Promise.all([
        gatewayFetch("/api/bookings/my-bookings", {
          method: "GET",
          attachAccessToken: true,
        }),
        gatewayFetch("/api/reviews/my", {
          method: "GET",
          attachAccessToken: true,
        }),
      ]);

      if (!bookingsRes.ok) {
        if (bookingsRes.status === 401) {
          router.push("/auth/login?redirect=/dashboard/reviews");
          return;
        }
        setError("Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.");
        return;
      }

      const bookingsData = await bookingsRes.json();
      const all = Array.isArray(bookingsData) ? bookingsData : bookingsData?.data ?? [];

      // Get existing reviews
      let reviews: ExistingReview[] = [];
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.data ?? [];
      }
      setExistingReviews(reviews);

      // Only show completed bookings (checked out) that can be reviewed
      const reviewable = all.filter(
        (b: any) =>
          b.status === "COMPLETED" ||
          (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date())
      );

      // Enrich bookings with room/roomType info
      const roomIds = [...new Set(reviewable.map((b: any) => b.roomId).filter(Boolean))];
      if (roomIds.length > 0) {
        try {
          const roomRes = await gatewayFetch("/api/rooms/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: roomIds }),
            attachAccessToken: true,
          });
          if (roomRes.ok) {
            const roomData = await roomRes.json();
            const rooms = Array.isArray(roomData) ? roomData : roomData?.data ?? [];
            const roomMap = new Map(rooms.map((r: any) => [r.id, r]));
            for (const b of reviewable) {
              if ((b as any).roomId && roomMap.has((b as any).roomId)) {
                b.room = roomMap.get((b as any).roomId);
              }
            }
          }
        } catch {
          // Room enrichment failed — continue with partial data
        }
      }

      setBookings(reviewable);
    } catch (err) {
      console.error("Error fetching reviewable bookings:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Set of bookingIds that already have reviews
  const reviewedBookingIds = new Set(existingReviews.map((r) => r.bookingId));

  function handleReviewClick(booking: ReviewableBooking) {
    setSelectedBooking(booking);
    setDialogOpen(true);
  }

  function handleReviewSuccess() {
    setDialogOpen(false);
    setSelectedBooking(null);
    void fetchData();
    alert("Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được ghi nhận.");
  }

  function getReviewForBooking(bookingId: string): ExistingReview | undefined {
    return existingReviews.find((r) => r.bookingId === bookingId);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
          <p className="text-gray-500 mt-2">
            Chia sẻ trải nghiệm của bạn về các phòng đã ở
          </p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => { setLoading(true); void fetchData(); }}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        )}

        {!error && bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Bạn chưa có đặt phòng nào cần đánh giá
              </p>
              <p className="text-sm text-gray-400">
                Sau khi hoàn tất đặt phòng, bạn có thể quay lại đây để đánh giá
              </p>
              <Link href="/rooms">
                <Button className="mt-4">Khám phá phòng</Button>
              </Link>
            </CardContent>
          </Card>
        ) : !error && bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const existingReview = getReviewForBooking(booking.id);
              const isReviewed = !!existingReview;

              return (
                <Card key={booking.id} className={isReviewed ? "border-green-200 bg-green-50/30" : ""}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Room Image */}
                      <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        {booking.room?.roomType?.images?.[0] ? (
                          <Image
                            src={booking.room.roomType.images[0]}
                            alt={booking.room.roomType.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Home className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {booking.room?.roomType?.name ?? "Phòng"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Phòng {booking.room?.roomNumber ?? "—"}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(booking.checkIn), "dd/MM/yyyy", {
                                locale: vi,
                              })}{" "}
                              -{" "}
                              {format(new Date(booking.checkOut), "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </span>
                          </div>
                        </div>

                        {isReviewed ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Đã đánh giá</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < existingReview.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            {existingReview.comment && (
                              <p className="text-sm text-gray-600 italic truncate max-w-md">
                                &ldquo;{existingReview.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleReviewClick(booking)}
                            className="gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Viết đánh giá
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}

        {/* Review Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Đánh giá của bạn</DialogTitle>
              <DialogDescription>
                Chia sẻ trải nghiệm của bạn để giúp khách hàng khác
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <ReviewForm
                bookingId={selectedBooking.id}
                roomTypeId={selectedBooking.room?.roomType?.id}
                roomId={selectedBooking.roomId}
                roomTypeName={selectedBooking.room?.roomType?.name ?? "phòng"}
                onSuccess={handleReviewSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
