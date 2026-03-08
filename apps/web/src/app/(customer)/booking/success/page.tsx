"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Home, Calendar, XCircle } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";

export default function BookingSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(sp.entries());

    if (params.vnp_ResponseCode) {
      verifyVnpayPayment(params);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyVnpayPayment = async (params: Record<string, string>) => {
    try {
      if (params.vnp_ResponseCode !== '00') {
        setError('Thanh toán không thành công. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      const response = await gatewayFetch("/api/payments/vnpay-return", {
        method: "POST",
        body: JSON.stringify(params),
        attachAccessToken: true,
      });

      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data);
      } else {
        setError('Xác nhận thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
      }
    } catch (err) {
      console.error("Verify payment error:", err);
      setError('Có lỗi xảy ra khi xác nhận thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
              Đang xác nhận thanh toán...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-900">
                  Thanh toán thất bại
                </CardTitle>
                <CardDescription className="text-red-700">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Thử lại
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
      </>
    );
  }

  return (
    <>
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
                      <p className="text-lg font-semibold">{bookingDetails.bookingId}</p>
                    </div>
                    {bookingDetails.vnpTransactionNo && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Mã giao dịch VNPay</p>
                        <p className="text-lg font-semibold text-green-600">
                          {bookingDetails.vnpTransactionNo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">Email xác nhận</p>
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
    </>
  );
}
