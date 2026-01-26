"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/booking-store";
import { ClientLayout } from "@/components/layout/client-layout";
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
  const [assignedRoomId, setAssignedRoomId] = useState<string | null>(null);
  const [assignedRoomNumber, setAssignedRoomNumber] = useState<string | null>(null);
  const [holdBookingId, setHoldBookingId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!bookingData) {
      router.push("/rooms");
      return;
    }

    checkAvailability();
  }, [bookingData, router]);

  const checkAvailability = async () => {
    if (!bookingData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await gatewayFetch("/api/booking/check-availability", {
        method: "POST",
        body: JSON.stringify({
          roomTypeId: bookingData.roomTypeId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check availability");
      }

      setAvailabilityChecked(true);
      setRoomAvailable(data.available);

      if (data.available) {
        setAssignedRoomId(data.roomId);
        setAssignedRoomNumber(data.roomNumber);
        await createHoldBooking(data.roomId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createHoldBooking = async (roomId: string) => {
    if (!bookingData) return;

    try {
      const response = await gatewayFetch("/api/booking/hold", {
        method: "POST",
        body: JSON.stringify({
          roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          totalPrice: bookingData.totalPrice,
        }),
        attachAccessToken: true,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create hold booking");
      }

      setHoldBookingId(data.booking.id);
      setExpiresAt(new Date(data.booking.expiresAt));
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  const handleCancel = () => {
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
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg">Checking availability...</p>
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
                  <h2 className="text-2xl font-bold mb-2">Room Not Available</h2>
                  <p className="text-gray-600 mb-6">
                    Sorry, this room is not available for your selected dates.
                  </p>
                  <Button onClick={() => router.push("/rooms")}>
                    View Other Rooms
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
                      Room Reserved
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Great news! Room <strong>{assignedRoomNumber}</strong> has been
                      reserved for you.
                    </p>

                    {expiresAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <HoldTimer expiresAt={expiresAt} onExpire={handleTimerExpire} />
                      </div>
                    )}

                    <Alert>
                      <AlertDescription>
                        Please complete your payment within the time limit to confirm your
                        booking. Your reservation will be automatically cancelled if payment
                        is not received.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Options</CardTitle>
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
                      Proceed to Payment
                    </Button>

                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full"
                      disabled={processingPayment}
                    >
                      Cancel Booking
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <BookingSummary
              roomName="Room Type"
              roomImage="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400"
              checkIn={new Date(bookingData.checkIn)}
              checkOut={new Date(bookingData.checkOut)}
              guests={bookingData.guests}
              nights={nights}
              pricePerNight={bookingData.totalPrice / nights}
              totalPrice={bookingData.totalPrice}
              guestName={bookingData.guestName}
              guestEmail={bookingData.guestEmail}
              guestPhone={bookingData.guestPhone}
            />
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
