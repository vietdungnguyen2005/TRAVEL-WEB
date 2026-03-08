"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User, Bed, Phone, Mail, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { gatewayFetch } from "@/lib/gateway-client";

interface Booking {
  id: string;
  checkIn?: string;
  checkOut?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  specialRequests?: string | null;
  createdAt: string;
  userId?: string;
  roomId?: string;
  user?: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  room?: {
    roomNumber: string;
    roomType: {
      name: string;
    };
  };
}

function getCheckIn(b: Booking) {
  return b.checkInDate || b.checkIn || "";
}
function getCheckOut(b: Booking) {
  return b.checkOutDate || b.checkOut || "";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border-green-200";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED":
      return "Thất bại";
    case "REFUND_REQUESTED":
      return "Yêu cầu hoàn tiền";
    case "REFUND_REJECTED":
      return "Từ chối hoàn tiền";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status;
  }
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "ALL") {
        params.append("status", filter);
      }

      const response = await gatewayFetch(`/api/admin/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      setUpdating(bookingId);
      const response = await gatewayFetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        attachAccessToken: true,
      });

      if (response.ok) {
        await fetchBookings();
      } else {
        alert("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setUpdating(null);
    }
  }

  async function approveRefund(bookingId: string) {
    try {
      setUpdating(bookingId);
      const response = await gatewayFetch("/api/payments/refund-approve", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
        attachAccessToken: true,
      });

      if (!response.ok) {
        alert("Không thể duyệt yêu cầu hoàn tiền");
        return;
      }

      await fetchBookings();
    } catch (error) {
      console.error("Error approving refund:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setUpdating(null);
    }
  }

  async function rejectRefund(bookingId: string) {
    try {
      setUpdating(bookingId);
      const response = await gatewayFetch("/api/payments/refund-reject", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
        attachAccessToken: true,
      });

      if (!response.ok) {
        alert("Không thể từ chối yêu cầu hoàn tiền");
        return;
      }

      await fetchBookings();
    } catch (error) {
      console.error("Error rejecting refund:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-gray-500 mt-2">
            Xem và quản lý tất cả đặt phòng trong hệ thống
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có đặt phòng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Mã đặt phòng: #{booking.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Đặt ngày: {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                    {booking.paymentStatus && (
                      <Badge variant="outline">
                        {getPaymentStatusText(booking.paymentStatus)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Thông tin khách hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      {booking.user ? (
                        <>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500">Tên:</span>
                            <span className="font-medium">
                              {booking.user.name || "Chưa cập nhật"}
                            </span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{booking.user.email}</span>
                          </p>
                          {booking.user.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{booking.user.phone}</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">
                          User ID: {booking.userId?.slice(0, 8) || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Thông tin đặt phòng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-gray-500">Phòng:</span>
                        <span className="font-medium">
                          {booking.room
                            ? `${booking.room.roomType.name} - Phòng ${booking.room.roomNumber}`
                            : `Room ID: ${booking.roomId?.slice(0, 8) || "N/A"}`}
                        </span>
                      </p>
                      {(getCheckIn(booking) || getCheckOut(booking)) && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {getCheckIn(booking) ? format(new Date(getCheckIn(booking)), "dd/MM/yyyy") : "?"} -{" "}
                            {getCheckOut(booking) ? format(new Date(getCheckOut(booking)), "dd/MM/yyyy") : "?"}
                          </span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{booking.numberOfGuests} khách</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-lg">
                          {formatCurrency(Number(booking.totalPrice))}
                        </span>
                      </p>
                      {booking.specialRequests && (
                        <p className="text-gray-600 mt-2">
                          <span className="font-medium">Yêu cầu đặc biệt:</span>{" "}
                          {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {booking.status === "PENDING" && (
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                      disabled={updating === booking.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating === booking.id ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                      disabled={updating === booking.id}
                    >
                      Hủy đặt phòng
                    </Button>
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                      disabled={updating === booking.id}
                    >
                      {updating === booking.id ? "Đang xử lý..." : "Đánh dấu hoàn thành"}
                    </Button>
                  </div>
                )}

                {booking.paymentStatus === "REFUND_REQUESTED" && (
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => approveRefund(booking.id)}
                      disabled={updating === booking.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating === booking.id ? "Đang xử lý..." : "Duyệt hoàn tiền"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectRefund(booking.id)}
                      disabled={updating === booking.id}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
