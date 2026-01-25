"use client";

import { use, useEffect, useState } from "react";
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
import Image from "next/image";
import { ClientLayout } from "@/components/layout/client-layout";

interface BookingData {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  holdExpiresAt: string;
  room: {
    id: string;
    roomNumber: string;
    roomType: {
      id: string;
      name: string;
      description: string;
      images: string[];
      pricePerNight: number;
    };
  };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    fetchBooking();
  }, [id]);

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

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/booking/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }
      const data = await response.json();
      
      if (data.status !== "ON_HOLD") {
        setError("This booking is no longer available for payment");
        return;
      }

      setBooking(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
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
      const response = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: "CASH",
        }),
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
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">Loading payment information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </ClientLayout>
    );
  }

  if (error && !booking) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/rooms")}>
            Back to Rooms
          </Button>
        </div>
      </div>
      </ClientLayout>
    );
  }

  if (!booking) return null;

  const nights = calculateNights();
  const pricePerNight = Number(booking.room.roomType.pricePerNight);

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>

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
                    <span className="font-medium">Time remaining to complete payment:</span>
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
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleStripePayment}
                disabled={processing}
                className="w-full h-16 text-lg"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with Card (Stripe)
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
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
                Pay at Hotel (Cash/Card)
              </Button>

              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Your payment is secure. We use industry-standard encryption to protect your information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.room.roomType.images[0] && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={booking.room.roomType.images[0]}
                    alt={booking.room.roomType.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg">{booking.room.roomType.name}</h3>
                <p className="text-sm text-muted-foreground">Room {booking.room.roomNumber}</p>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Check-in</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.checkIn), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Check-out</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.checkOut), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Guests</p>
                    <p className="text-muted-foreground">
                      {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Nights</p>
                    <p className="text-muted-foreground">{nights} nights</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{pricePerNight.toLocaleString("vi-VN")} VND x {nights} nights</span>
                  <span>{(pricePerNight * nights).toLocaleString("vi-VN")} VND</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{Number(booking.totalPrice).toLocaleString("vi-VN")} VND</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
}
