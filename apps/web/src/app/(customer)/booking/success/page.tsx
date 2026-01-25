"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Home, Calendar } from "lucide-react";
import { ClientLayout } from "@/components/layout/client-layout";

export default function BookingSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Read search params on client runtime to avoid using useSearchParams during prerender.
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get("session_id");
    setSessionId(id);
    if (id) verifyPayment(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async (id?: string | null) => {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id ?? sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data.booking);
      }
    } catch (error) {
      console.error("Verify payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
              Đang xác nhận thanh toán...
            </p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">
                Thanh toán thành công!
              </CardTitle>
              <CardDescription className="text-green-700">
                Đặt phòng của bạn đã được xác nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bookingDetails && (
                <div className="rounded-lg bg-white p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Mã đặt phòng</p>
                      <p className="text-lg font-semibold">{bookingDetails.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="text-lg font-semibold text-green-600">
                        {Number(bookingDetails.totalPrice).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Loại phòng</p>
                      <p className="font-medium">{bookingDetails.room?.roomType?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số phòng</p>
                      <p className="font-medium">Phòng {bookingDetails.room?.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nhận phòng</p>
                      <p className="font-medium">
                        {new Date(bookingDetails.checkIn).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trả phòng</p>
                      <p className="font-medium">
                        {new Date(bookingDetails.checkOut).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">📧 Email xác nhận</p>
                <p className="text-sm text-blue-700">
                  Chúng tôi đã gửi email xác nhận đặt phòng đến địa chỉ của bạn.
                  Vui lòng kiểm tra hộp thư (bao gồm cả thư spam).
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/dashboard/bookings")}
                  className="flex-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Xem đặt phòng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
