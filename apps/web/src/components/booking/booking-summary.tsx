import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Users, Mail, Phone, User } from "lucide-react";

interface BookingSummaryProps {
  roomName: string;
  roomImage: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export function BookingSummary({
  roomName,
  roomImage,
  checkIn,
  checkOut,
  guests,
  nights,
  pricePerNight,
  totalPrice,
  guestName,
  guestEmail,
  guestPhone,
}: BookingSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
            <Image
              src={roomImage}
              alt={roomName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
          </div>
          <h3 className="text-xl font-semibold">{roomName}</h3>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-semibold">Stay Details</h4>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>Check-in: {format(checkIn, "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>Check-out: {format(checkOut, "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="text-sm text-gray-600">
            Total: {nights} {nights === 1 ? 'night' : 'nights'}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-semibold">Guest Information</h4>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{guestName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{guestEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{guestPhone}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold">Price Details</h4>
          <div className="flex justify-between text-sm">
            <span>{pricePerNight.toLocaleString("vi-VN")}d x {nights} nights</span>
            <span>{totalPrice.toLocaleString("vi-VN")}d</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{totalPrice.toLocaleString("vi-VN")}d</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
