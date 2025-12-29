"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Edit, Trash2, Bed } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface RoomType {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedCount: number;
  size: number;
  amenities: string[];
  images: string[];
  featured: boolean;
  available: boolean;
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState<Partial<RoomType>>({
    amenities: [],
    images: [],
    featured: false,
    available: true,
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/admin/room-types");
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      toast.error("Không thể tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setFormData(roomType);
    } else {
      setEditingRoomType(null);
      setFormData({
        amenities: [],
        images: [],
        featured: false,
        available: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingRoomType
      ? `/api/admin/room-types/${editingRoomType.id}`
      : "/api/admin/room-types";
    
    const method = editingRoomType ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingRoomType ? "Cập nhật thành công!" : "Thêm loại phòng thành công!"
        );
        setIsDialogOpen(false);
        fetchRoomTypes();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error("Có lỗi xảy ra", { description: message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa loại phòng này?")) return;

    try {
      const response = await fetch(`/api/admin/room-types/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Xóa thành công!");
        fetchRoomTypes();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Không thể xóa loại phòng");
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenity],
      });
    } else {
      setFormData({
        ...formData,
        amenities: (formData.amenities || []).filter((a) => a !== amenity),
      });
    }
  };

  const commonAmenities = [
    "WiFi miễn phí",
    "Điều hòa",
    "Tivi",
    "Tủ lạnh",
    "Bàn làm việc",
    "Ban công",
    "Bồn tắm",
    "Máy sấy tóc",
    "Két sắt",
    "Minibar",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý loại phòng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các loại phòng và thông tin chi tiết
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm loại phòng
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <Card key={roomType.id}>
              <CardHeader className="p-0">
                {roomType.images[0] ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={roomType.images[0]}
                      alt={roomType.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <Bed className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{roomType.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {roomType.pricePerNight.toLocaleString("vi-VN")} VNĐ
                    <span className="text-sm font-normal text-muted-foreground">
                      /đêm
                    </span>
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                  <div>{roomType.capacity} khách</div>
                  <div>{roomType.bedCount} giường</div>
                  <div>{roomType.size} m²</div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {roomType.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(roomType)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(roomType.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoomType ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về loại phòng
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tên loại phòng *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="pricePerNight">Giá/đêm (VNĐ) *</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  value={formData.pricePerNight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerNight: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity">Sức chứa (người) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="bedCount">Số giường *</Label>
                <Input
                  id="bedCount"
                  type="number"
                  value={formData.bedCount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bedCount: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="size">Diện tích (m²) *</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, size: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label className="mb-3 block">Tiện nghi</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities?.includes(amenity)}
                      onCheckedChange={(checked) =>
                        handleAmenityChange(amenity, checked as boolean)
                      }
                    />
                    <label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Hình ảnh phòng</Label>
              <ImageUpload
                value={formData.images || []}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={8}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked as boolean })
                  }
                />
                <label htmlFor="featured" className="text-sm cursor-pointer">
                  Nổi bật
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked as boolean })
                  }
                />
                <label htmlFor="available" className="text-sm cursor-pointer">
                  Có sẵn
                </label>
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
              <Button type="submit">
                {editingRoomType ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
