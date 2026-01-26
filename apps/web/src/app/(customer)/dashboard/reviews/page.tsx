"use client";

import { useEffect, useState } from "react";
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
import { Star, Calendar, Home } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";

interface ReviewableBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  room: {
    roomNumber: string;
    roomType: {
      id: string;
      name: string;
      images: string[];
    };
  };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ReviewableBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ReviewableBooking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviewableBookings();
  }, []);

  async function fetchReviewableBookings() {
    try {
      const response = await gatewayFetch("/api/reviews/my-reviewable", {
        method: "GET",
        attachAccessToken: true,
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login?redirect=/dashboard/reviews");
          return;
        }
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching reviewable bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleReviewClick(booking: ReviewableBooking) {
    setSelectedBooking(booking);
    setDialogOpen(true);
  }

  function handleReviewSuccess() {
    setDialogOpen(false);
    setSelectedBooking(null);
    fetchReviewableBookings();
    alert("Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được ghi nhận.");
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
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

        {bookings.length === 0 ? (
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
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Room Image */}
                    <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      {booking.room.roomType.images[0] ? (
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
                        {booking.room.roomType.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Phòng {booking.room.roomNumber}
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

                      <Button
                        onClick={() => handleReviewClick(booking)}
                        className="gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Viết đánh giá
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
                roomTypeName={selectedBooking.room.roomType.name}
                onSuccess={handleReviewSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}
