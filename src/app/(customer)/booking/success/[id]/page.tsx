"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Loader2,
  Calendar,
  Users,
  Home,
  Mail,
  Phone,
  User,
  Download,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";

interface BookingData {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
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

export default function BookingSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/booking/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">Loading booking details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </ClientLayout>
    );
  }

  if (!booking) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
            <Button onClick={() => router.push("/rooms")}>
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
      </ClientLayout>
    );
  }

  const nights = calculateNights();
  const pricePerNight = Number(booking.room.roomType.pricePerNight);

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Your reservation has been successfully confirmed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-primary/5">
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {booking.room.roomType.images[0] && (
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={booking.room.roomType.images[0]}
                      alt={booking.room.roomType.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-xl mb-1">{booking.room.roomType.name}</h3>
                <p className="text-muted-foreground mb-4">Room {booking.room.roomNumber}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono font-semibold">{booking.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-green-600">
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-semibold">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Stay Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.checkIn), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.checkOut), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {nights} {nights === 1 ? "night" : "nights"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "guest" : "guests"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.guestName && (
                  <div>
                    <h4 className="font-semibold mb-3">Guest Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.guestName}</span>
                      </div>
                      {booking.guestEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.guestEmail}</span>
                        </div>
                      )}
                      {booking.guestPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.guestPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{pricePerNight.toLocaleString("vi-VN")} VND x {nights} nights</span>
                <span>{(pricePerNight * nights).toLocaleString("vi-VN")} VND</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total Paid</span>
                <span className="text-green-600">
                  {Number(booking.totalPrice).toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Important Information</h4>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Check-in time: 2:00 PM</li>
            <li>Check-out time: 12:00 PM</li>
            <li>Please bring a valid ID for check-in</li>
            <li>Confirmation email has been sent to your email address</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Confirmation
          </Button>
          <Link href="/rooms" className="flex-1">
            <Button className="w-full">
              Browse More Rooms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
}
