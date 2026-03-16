"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/booking-store";
import { BookingSummary } from "@/components/booking/booking-summary";
import { HoldTimer } from "@/components/booking/hold-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";

export default function BookingConfirmPage() {
  const router = useRouter();
  const bookingData = useBookingStore((state) => state.bookingData);
  const clearBooking = useBookingStore((state) => state.clearBookingData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [roomAvailable, setRoomAvailable] = useState(false);
  const [holdBookingId, setHoldBookingId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const holdCalledRef = useRef(false);

  const createHoldBooking = useCallback(async (roomId: string) => {
    if (!bookingData) return;

    try {
      const response = await gatewayFetch("/api/bookings/hold", {
        method: "POST",
        body: JSON.stringify({
          // userId will be derived server-side from JWT via Authorization/cookie.
          roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          numberOfGuests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
        }),
        attachAccessToken: true,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create hold booking");
      }

      // booking-service returns booking directly
      setHoldBookingId(data.id);
      setExpiresAt(new Date(data.holdExpiresAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hold booking");
    }
  }, [bookingData]);

  const checkAvailability = useCallback(async () => {
    if (!bookingData) return;

    try {
      setLoading(true);
      setError(null);

      // Send all available roomIds so booking-service can find one without conflicts
      const roomIds: string[] = bookingData.roomIds ?? (bookingData.roomId ? [bookingData.roomId] : []);

      const response = await gatewayFetch("/api/bookings/check-availability", {
        method: "POST",
        body: JSON.stringify({
          roomIds,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          numberOfGuests: bookingData.guests,
        }),
        attachAccessToken: true,
      });

      const data = await response.json().catch(() => ({} as Record<string, unknown>));

      if (!response.ok) {
        const message =
          typeof (data as any)?.error === "string" ? (data as any).error : "Failed to check availability";
        throw new Error(message);
      }

      const available = Boolean((data as any)?.available);
      const availableRoomId = (data as any)?.availableRoomId ?? bookingData.roomId;
      setAvailabilityChecked(true);
      setRoomAvailable(available);

      if (available) {
        await createHoldBooking(availableRoomId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check availability");
    } finally {
      setLoading(false);
    }
  }, [bookingData, createHoldBooking]);

  useEffect(() => {
    if (!bookingData) {
      router.push("/rooms");
      return;
    }

    if (holdCalledRef.current) return;
    holdCalledRef.current = true;

    void checkAvailability();
  }, [bookingData, router, checkAvailability]);

  const handleTimerExpire = () => {
    setError("Your reservation has expired. Please start over.");
    setTimeout(() => {
      clearBooking();
      router.push("/rooms");
    }, 3000);
  };

  const handleProceedToPayment = () => {
    setProcessingPayment(true);
    router.push(`/booking/payment/${holdBookingId}`);
  };

  const handleCancel = async () => {
    // Release the ON_HOLD booking server-side so the room becomes available again
    if (holdBookingId) {
      try {
        await gatewayFetch(`/api/bookings/${holdBookingId}/cancel`, {
          method: "POST",
          attachAccessToken: true,
        });
      } catch (err) {
        // Best-effort: if cancel fails, the hold will expire automatically
        console.error("Failed to cancel hold booking:", err);
      }
    }
    clearBooking();
    router.push("/rooms");
  };

  if (!bookingData) {
    return null;
  }

  const nights = differenceInDays(
    new Date(bookingData.checkOut),
    new Date(bookingData.checkIn)
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Xác nhận đặt phòng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg">Đang kiểm tra phòng trống...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {availabilityChecked && !roomAvailable && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Phòng không còn trống</h2>
                  <p className="text-gray-600 mb-6">
                    Xin lỗi, phòng này không còn trống cho ngày bạn đã chọn.
                  </p>
                  <Button onClick={() => router.push("/rooms")}>
                    Xem phòng khác
                  </Button>
                </CardContent>
              </Card>
            )}

            {availabilityChecked && roomAvailable && !loading && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Đã giữ phòng thành công
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Tin vui! Phòng (<strong>{bookingData?.roomTypeName || "Standard"}</strong>) đã được
                      giữ cho bạn.
                    </p>

                    {expiresAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <HoldTimer expiresAt={expiresAt} onExpire={handleTimerExpire} />
                      </div>
                    )}

                    <Alert>
                      <AlertDescription>
                        Vui lòng hoàn tất thanh toán trong thời gian giữ phòng để xác nhận
                        đặt phòng. Đặt phòng của bạn sẽ tự động bị hủy nếu không thanh toán
                        kịp thời.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phương thức thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleProceedToPayment}
                      disabled={processingPayment}
                      className="w-full"
                      size="lg"
                    >
                      {processingPayment && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Tiến hành thanh toán
                    </Button>

                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full"
                      disabled={processingPayment}
                    >
                      Hủy đặt phòng
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <BookingSummary
              roomName={bookingData.roomTypeName || "Room Type"}
              roomImage={bookingData.roomTypeImage || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400"}
              checkIn={new Date(bookingData.checkIn)}
              checkOut={new Date(bookingData.checkOut)}
              guests={bookingData.guests}
              nights={nights}
              pricePerNight={nights > 0 ? bookingData.totalPrice / nights : bookingData.totalPrice}
              totalPrice={bookingData.totalPrice}
              guestName={bookingData.guestName}
              guestEmail={bookingData.guestEmail}
              guestPhone={bookingData.guestPhone}
            />
          </div>
        </div>
      </div>
    </>
  );
}
