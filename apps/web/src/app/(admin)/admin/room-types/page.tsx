"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, DollarSign, MapPin } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";

interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  location: string;
  amenities: string[];
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomTypeForm {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  location: string;
  amenities: string;
  isActive: boolean;
}

const EMPTY_FORM: RoomTypeForm = {
  name: "",
  description: "",
  pricePerNight: 0,
  maxGuests: 2,
  location: "",
  amenities: "",
  isActive: true,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form, setForm] = useState<RoomTypeForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  async function fetchRoomTypes() {
    try {
      setLoading(true);
      const response = await gatewayFetch("/api/admin/room-types", {
        method: "GET",
        attachAccessToken: true,
      });
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(Array.isArray(data) ? data : data?.data ?? []);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }

  function openEdit(rt: RoomType) {
    setEditing(rt);
    setForm({
      name: rt.name,
      description: rt.description,
      pricePerNight: rt.pricePerNight,
      maxGuests: rt.maxGuests,
      location: rt.location || "",
      amenities: rt.amenities.join(", "),
      isActive: rt.isActive,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editing
        ? `/api/admin/room-types/${editing.id}`
        : "/api/admin/room-types";
      const method = editing ? "PATCH" : "POST";

      const body = {
        name: form.name,
        description: form.description,
        pricePerNight: form.pricePerNight,
        maxGuests: form.maxGuests,
        location: form.location,
        amenities: form.amenities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };

      const response = await gatewayFetch(url, {
        method,
        body: JSON.stringify(body),
        attachAccessToken: true,
      });

      if (response.ok) {
        await fetchRoomTypes();
        setIsDialogOpen(false);
      } else {
        const error = await response.json().catch(() => ({}));
        alert((error as { error?: string }).error || "Không thể lưu loại phòng");
      }
    } catch (error) {
      console.error("Error saving room type:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa loại phòng này?")) return;

    try {
      const response = await gatewayFetch(`/api/admin/room-types/${id}`, {
        method: "DELETE",
        attachAccessToken: true,
      });

      if (response.ok || response.status === 204) {
        await fetchRoomTypes();
      } else {
        const error = await response.json().catch(() => ({}));
        alert((error as { error?: string }).error || "Không thể xóa loại phòng");
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      alert("Đã xảy ra lỗi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý loại phòng
          </h1>
          <p className="text-gray-500 mt-2">
            Tạo và quản lý các loại phòng trong hệ thống
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm loại phòng
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : roomTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Chưa có loại phòng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((rt) => (
            <Card key={rt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{rt.name}</CardTitle>
                  <Badge
                    className={
                      rt.isActive
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {rt.isActive ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {rt.description || "(Chưa có mô tả)"}
                  </p>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-lg text-blue-600">
                      {formatCurrency(Number(rt.pricePerNight))}
                    </span>
                    <span className="text-sm text-gray-500">/ đêm</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      Tối đa {rt.maxGuests} khách
                    </span>
                  </div>

                  {rt.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {rt.location}
                      </span>
                    </div>
                  )}

                  {rt.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rt.amenities.slice(0, 4).map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                      {rt.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{rt.amenities.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(rt)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(rt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Cập nhật thông tin loại phòng"
                : "Nhập thông tin loại phòng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Tên loại phòng</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="VD: Deluxe, Suite, Standard..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Mô tả về loại phòng..."
                />
              </div>
              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="VD: Hà Nội, Đà Nẵng, Nha Trang..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerNight">Giá mỗi đêm (VND)</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    min="1"
                    value={form.pricePerNight}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricePerNight: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests">Số khách tối đa</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min="1"
                    value={form.maxGuests}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxGuests: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="amenities">
                  Tiện nghi (phân cách bằng dấu phẩy)
                </Label>
                <Input
                  id="amenities"
                  value={form.amenities}
                  onChange={(e) =>
                    setForm({ ...form, amenities: e.target.value })
                  }
                  placeholder="Wifi, TV, Điều hòa, Mini Bar..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Đang hoạt động</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
