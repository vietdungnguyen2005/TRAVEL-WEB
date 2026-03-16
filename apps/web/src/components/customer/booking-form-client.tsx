"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookingForm, BookingData } from "./booking-form";
import { useBookingStore } from "@/store/booking-store";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";

function hasAccessTokenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c.startsWith("access_token="));
}

interface BookingFormClientProps {
  roomTypeId: string;
  roomTypeName?: string;
  basePrice: number;
  capacity: number;
  roomIds?: string[];
  roomTypeImage?: string;
}

export function BookingFormClient({ roomTypeId, roomTypeName, basePrice, capacity, roomIds, roomTypeImage }: BookingFormClientProps) {
  const router = useRouter();
  const setBookingData = useBookingStore((state) => state.setBookingData);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (data: BookingData) => {
    setIsChecking(true);

    try {
      // Guests must log in before booking.
      if (!hasAccessTokenCookie()) {
        toast.error("Vui lòng đăng nhập để đặt phòng");
        const params = new URLSearchParams();
        params.set("redirect", `/booking/confirm`);
        router.push(`/auth/login?${params.toString()}`);
        return;
      }

      // Check availability via API
      const response = await gatewayFetch("/api/rooms/availability", {
        method: "POST",
        body: JSON.stringify({
          roomTypeId,
          checkIn: data.checkIn.toISOString(),
          checkOut: data.checkOut.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Không thể kiểm tra phòng trống");
        setIsChecking(false);
        return;
      }

      if (!result.available || !result.availableRooms || result.availableRooms.length === 0) {
        toast.error("Không có phòng trống trong khoảng thời gian này");
        setIsChecking(false);
        return;
      }

      // Calculate total price (may include seasonal pricing)
      const numberOfNights = Math.ceil(
        (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Store booking data in Zustand
      setBookingData({
        roomTypeId,
        roomTypeName: roomTypeName || roomTypeId,
        roomTypeImage: roomTypeImage || null,
        roomId: result.availableRooms[0].id, // Use first available room
        roomIds: result.availableRooms.map((r: { id: string }) => r.id), // All available rooms for fallback
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        specialRequests: data.specialRequests,
        totalPrice: result.totalPrice || basePrice * numberOfNights,
      });

      toast.success("Phòng có sẵn! Đang chuyển đến trang xác nhận...");
      router.push("/booking/confirm");
    } catch (error) {
      console.error("Availability check error:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <BookingForm
      roomTypeId={roomTypeId}
      basePrice={basePrice}
      capacity={capacity}
      onSubmit={handleSubmit}
      isSubmitting={isChecking}
      roomIds={roomIds}
    />
  );
}
