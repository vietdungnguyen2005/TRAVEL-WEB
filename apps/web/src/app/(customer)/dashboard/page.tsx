"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  Clock,
  XCircle,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Download,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";
import { RefundRequestButton } from "@/components/customer/refund-request-button";

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  room: {
    roomNumber: string;
    roomType: {
      name: string;
      images: string[];
      description: string;
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await gatewayFetch("/api/bookings/my-bookings", {
        method: "GET",
        attachAccessToken: true,
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login?redirect=/dashboard");
          return;
        }
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const response = await gatewayFetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        attachAccessToken: true,
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      await fetchBookings();
      alert("Booking cancelled successfully");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "ON_HOLD":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "ON_HOLD":
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "PENDING") &&
      new Date(b.checkIn) > new Date()
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status === "COMPLETED" ||
      (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date())
  );

  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const canCancel =
      booking.status === "CONFIRMED" &&
      new Date(booking.checkIn) > new Date(Date.now() + 24 * 60 * 60 * 1000);

    return (
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative h-48 md:h-full">
            {booking.room.roomType.images[0] && (
              <Image
                src={booking.room.roomType.images[0]}
                alt={booking.room.roomType.name}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="col-span-2 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {booking.room.roomType.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Room {booking.room.roomNumber}
                </p>
              </div>
              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.checkIn), "PPP")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-out</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.checkOut), "PPP")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Guests</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.numberOfGuests}{" "}
                    {booking.numberOfGuests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">
                  {Number(booking.totalPrice).toLocaleString("vi-VN")} VND
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment: {booking.paymentStatus} ({booking.paymentMethod})
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/booking/success/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>

                <RefundRequestButton
                  bookingId={booking.id}
                  paymentStatus={booking.paymentStatus}
                />
                {canCancel && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your bookings and account settings
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start planning your next stay
                  </p>
                  <Link href="/rooms">
                    <Button>Browse Rooms</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-muted-foreground">
                    Your booking history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Cancelled Bookings
                  </h3>
                  <p className="text-muted-foreground">
                    You have not cancelled any bookings
                  </p>
                </CardContent>
              </Card>
            ) : (
              cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
}
