"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Home,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";

interface BookingData {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  holdExpiresAt: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [roomLabel, setRoomLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await gatewayFetch(`/api/bookings/${id}`, {
        method: "GET",
        attachAccessToken: true,
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/booking/payment/${id}`)}`);
          return;
        }
        if (response.status === 404) {
          throw new Error("Booking not found");
        }
        throw new Error("Failed to fetch booking");
      }

      const data = await response.json();

      if (data?.status !== "ON_HOLD") {
        setError("This booking is no longer available for payment");
        return;
      }

      setBooking(data as BookingData);

      // Fetch room info to show room number/type instead of raw ID
      try {
        const roomRes = await gatewayFetch(`/api/rooms/by-ids`, {
          method: "POST",
          body: JSON.stringify({ ids: [data.roomId] }),
        });
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          const room = roomData?.data?.[0];
          if (room) {
            setRoomLabel(`${room.roomType?.name || "Room"} - #${room.roomNumber}`);
          }
        }
      } catch {
        // Fallback: show shortened room ID
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    if (!booking?.holdExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(booking.holdExpiresAt).getTime();
      const remaining = expires - now;

      if (remaining <= 0) {
        setError("Booking hold has expired. Please start over.");
        clearInterval(interval);
        setTimeout(() => {
          router.push("/rooms");
        }, 3000);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.holdExpiresAt, router]);

  const handleVnpayPayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await gatewayFetch("/api/payments/create-payment-url", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
        }),
        attachAccessToken: true,
      });

      if (!response.ok) {
        throw new Error("Failed to create payment URL");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await gatewayFetch("/api/payments/confirm", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: "CASH",
          amount: booking.totalPrice,
        }),
        attachAccessToken: true,
      });

      if (!response.ok) {
        throw new Error("Payment confirmation failed");
      }

      router.push(`/booking/success/${booking.id}`);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg">Đang tải thông tin thanh toán...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error && !booking) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/rooms")}>
              Quay lại danh sách phòng
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!booking) return null;

  const nights = calculateNights();
  const pricePerNight = nights > 0 ? Number(booking.totalPrice) / nights : Number(booking.totalPrice);
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {timeRemaining > 0 && (
              <Card className={timeRemaining < 300000 ? "border-red-500" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-5 w-5 ${timeRemaining < 300000 ? "text-red-500" : ""}`} />
                      <span className="font-medium">Thời gian còn lại:</span>
                    </div>
                    <span className={`text-2xl font-bold ${timeRemaining < 300000 ? "text-red-500" : ""}`}>
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleVnpayPayment}
                  disabled={processing}
                  className="w-full h-16 text-lg"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Thanh toán qua VNPay
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Hoặc
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleDirectPayment}
                  disabled={processing}
                  variant="outline"
                  className="w-full h-16 text-lg"
                  size="lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Thanh toán tại khách sạn
                </Button>

                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Thanh toán của bạn được bảo mật. Chúng tôi sử dụng mã hóa tiêu chuẩn để bảo vệ thông tin của bạn.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đặt phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Đặt phòng</h3>
                  <p className="text-sm text-muted-foreground">{roomLabel || `Mã phòng: ${booking.roomId.substring(0, 8)}...`}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Nhận phòng</p>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.checkIn), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Trả phòng</p>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.checkOut), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Số khách</p>
                      <p className="text-muted-foreground">
                        {booking.numberOfGuests} khách
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Số đêm</p>
                      <p className="text-muted-foreground">{nights} đêm</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{pricePerNight.toLocaleString("vi-VN")} VND x {nights} đêm</span>
                    <span>{(pricePerNight * nights).toLocaleString("vi-VN")} VND</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span>{Number(booking.totalPrice).toLocaleString("vi-VN")} VND</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
