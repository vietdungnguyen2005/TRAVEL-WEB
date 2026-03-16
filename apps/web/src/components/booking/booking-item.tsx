"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Calendar, Users, Clock, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";

interface BookingItemProps {
  booking: any;
}

export function BookingItem({ booking }: BookingItemProps) {
  const [paying, setPaying] = useState(false);

  const numberOfNights = differenceInDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "ON_HOLD":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "ON_HOLD":
        return "Chờ thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      case "PENDING":
        return "Đang xử lý";
      case "COMPLETED":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const response = await gatewayFetch("/api/payments/create-payment-url", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking.id, amount: booking.totalPrice }),
        attachAccessToken: true,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error("Thanh toán thất bại", {
        description: error.message,
      });
      setPaying(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{booking.room?.roomType?.name ?? "Phòng"}</h3>
            <p className="text-sm text-muted-foreground">
              Mã đặt phòng: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusText(booking.status)}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Nhận phòng: {format(new Date(booking.checkIn), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Trả phòng: {format(new Date(booking.checkOut), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.numberOfGuests} khách</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{numberOfNights} đêm</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Tổng tiền</span>
            <p className="text-xl font-bold">
              {Number(booking.totalPrice).toLocaleString("vi-VN")}đ
            </p>
          </div>
          <div className="flex gap-2">
            {booking.status === "ON_HOLD" && (
              <Button onClick={handlePayment} disabled={paying}>
                {paying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán ngay
                  </>
                )}
              </Button>
            )}
            <Link href={`/booking/success/${booking.id}`}>
              <Button variant="outline">Xem chi tiết</Button>
            </Link>
            {(booking.status === "CONFIRMED" || booking.status === "ON_HOLD" || booking.status === "PENDING") && (
              <CancelBookingButton
                bookingId={booking.id}
                roomName={booking.room?.roomType?.name ?? "Phòng"}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
