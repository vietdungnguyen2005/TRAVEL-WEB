"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CancelBookingButtonProps {
  bookingId: string;
  roomName?: string;
  onSuccess?: () => void;
}

export function CancelBookingButton({ bookingId, roomName, onSuccess }: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await gatewayFetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        attachAccessToken: true,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể hủy đặt phòng");
      }

      toast.success("Hủy đặt phòng thành công!", {
        description: roomName ? `Đặt phòng ${roomName} đã được hủy` : "Đặt phòng đã được hủy"
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast.error("Hủy đặt phòng thất bại", {
        description: error.message || "Vui lòng thử lại sau"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
          {loading ? "Đang xử lý..." : "Hủy đặt phòng"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy đặt phòng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy đặt phòng{roomName ? <> <strong>{roomName}</strong></> : ""}?
            <br />
            <br />
            Hành động này không thể hoàn tác. Vui lòng kiểm tra chính sách hủy phòng
            trước khi xác nhận.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
