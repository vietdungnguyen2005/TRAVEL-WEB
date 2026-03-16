"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRight,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { gatewayFetch } from "@/lib/gateway-client";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { RefundRequestButton } from "@/components/customer/refund-request-button";

interface BookingData {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string | null;
  paymentMethod: string;
  room?: {
    id: string;
    roomNumber: string;
    roomType: {
      id: string;
      name: string;
    };
  };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        icon: CheckCircle2,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        title: "Đặt phòng đã xác nhận!",
        subtitle: "Đặt phòng của bạn đã được xác nhận thành công",
      };
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        title: "Đã hoàn thành",
        subtitle: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi",
      };
    case "CANCELLED":
      return {
        icon: XCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        title: "Đã hủy đặt phòng",
        subtitle: "Đặt phòng này đã bị hủy",
      };
    case "ON_HOLD":
      return {
        icon: Clock,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        title: "Chờ thanh toán",
        subtitle: "Vui lòng thanh toán để xác nhận đặt phòng",
      };
    case "PENDING":
      return {
        icon: Clock,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        title: "Đang xử lý",
        subtitle: "Đặt phòng của bạn đang được xử lý",
      };
    default:
      return {
        icon: AlertCircle,
        iconColor: "text-gray-600",
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        title: status,
        subtitle: "",
      };
  }
}

function getPaymentStatusText(paymentStatus: string | null) {
  if (!paymentStatus) return "Chưa thanh toán";
  switch (paymentStatus) {
    case "PAID":
      return "Đã thanh toán";
    case "PENDING":
      return "Chờ thanh toán";
    case "REFUNDED":
      return "Đã hoàn tiền";
    case "REFUND_REQUESTED":
      return "Yêu cầu hoàn tiền";
    case "REFUND_REJECTED":
      return "Từ chối hoàn tiền";
    default:
      return paymentStatus;
  }
}

function getPaymentStatusColor(paymentStatus: string | null) {
  if (!paymentStatus) return "text-gray-500";
  switch (paymentStatus) {
    case "PAID":
      return "text-green-600";
    case "PENDING":
      return "text-yellow-600";
    case "REFUNDED":
      return "text-blue-600";
    case "REFUND_REQUESTED":
      return "text-orange-600";
    case "REFUND_REJECTED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      // Fetch booking by ID
      const response = await gatewayFetch(`/api/bookings/${id}`, {
        method: "GET",
        attachAccessToken: true,
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/booking/success/${id}`)}`);
          return;
        }
        throw new Error("Failed to fetch booking");
      }

      const data = (await response.json()) as BookingData;

      // Enrich with room details from room-service
      if (data.roomId) {
        try {
          const roomRes = await gatewayFetch("/api/rooms/by-ids", {
            method: "POST",
            body: JSON.stringify({ ids: [data.roomId] }),
          });
          if (roomRes.ok) {
            const roomData = (await roomRes.json()) as { data?: { id: string; roomNumber: string; roomType: { id: string; name: string } }[] };
            if (roomData.data?.[0]) {
              data.room = roomData.data[0];
            }
          }
        } catch {
          // Room enrichment is optional — continue without it
        }
      }

      setBooking(data);
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

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
      <>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg">Đang tải chi tiết đặt phòng...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-4">Không tìm thấy đặt phòng</h2>
              <Button onClick={() => router.push("/rooms")}>
                Xem phòng
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const nights = calculateNights();
  const totalPrice = Number(booking.totalPrice);
  const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;
  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED" || booking.status === "ON_HOLD";
  const canRequestRefund = booking.status === "CANCELLED" && booking.paymentStatus === "PAID";

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.bgColor} mb-4`}>
              <StatusIcon className={`h-10 w-10 ${statusConfig.iconColor}`} />
            </div>
            <h1 className="text-3xl font-bold mb-2">{statusConfig.title}</h1>
            <p className="text-lg text-muted-foreground">
              {statusConfig.subtitle}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader className="bg-primary/5">
              <CardTitle>Chi tiết đặt phòng</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {booking.room?.roomType && (
                    <h3 className="font-semibold text-xl mb-1">{booking.room.roomType.name}</h3>
                  )}
                  {booking.room?.roomNumber && (
                    <p className="text-muted-foreground mb-4">Phòng {booking.room.roomNumber}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Mã đặt phòng</span>
                      <span className="font-mono font-semibold">{booking.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Trạng thái</span>
                      <span className={`font-semibold ${statusConfig.textColor}`}>
                        {statusConfig.title}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Thanh toán</span>
                      <span className={`font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {getPaymentStatusText(booking.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Chi tiết lưu trú</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Nhận phòng</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.checkIn), "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Trả phòng</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.checkOut), "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Thời gian</p>
                          <p className="text-sm text-muted-foreground">
                            {nights} đêm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Số khách</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.numberOfGuests} khách
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.guestName && (
                    <div>
                      <h4 className="font-semibold mb-3">Thông tin khách</h4>
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
                  <span>{pricePerNight.toLocaleString("vi-VN")} VND x {nights} đêm</span>
                  <span>{(pricePerNight * nights).toLocaleString("vi-VN")} VND</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>
                    {booking.paymentStatus === "PAID" || booking.paymentStatus === "REFUNDED"
                      ? "Đã thanh toán"
                      : "Tổng tiền"}
                  </span>
                  <span className={booking.status === "CANCELLED" ? "text-red-600 line-through" : "text-green-600"}>
                    {Number(booking.totalPrice).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons based on status */}
          {(canCancel || canRequestRefund) && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Thao tác</h4>
                <div className="flex flex-wrap gap-3">
                  {canCancel && (
                    <CancelBookingButton
                      bookingId={booking.id}
                      onSuccess={() => void fetchBooking()}
                    />
                  )}
                  {canRequestRefund && (
                    <RefundRequestButton
                      bookingId={booking.id}
                      paymentStatus={booking.paymentStatus || ""}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {booking.status !== "CANCELLED" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Thông tin quan trọng</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Giờ nhận phòng: 14:00</li>
                <li>Giờ trả phòng: 12:00</li>
                <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
                <li>Email xác nhận đã được gửi đến địa chỉ email của bạn</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Tải xác nhận
            </Button>
            <Link href="/dashboard/bookings" className="flex-1">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Đặt phòng của tôi
              </Button>
            </Link>
            <Link href="/rooms" className="flex-1">
              <Button className="w-full">
                Xem thêm phòng
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
