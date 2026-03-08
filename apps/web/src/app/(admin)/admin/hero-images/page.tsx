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
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
import Image from "next/image";

interface HeroImage {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  active: boolean;
}

interface FormData {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  order?: number;
  active?: boolean;
}

export default function HeroImagesPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState<FormData>({
    active: true,
    order: 0,
  });

  useEffect(() => {
    fetchHeroImages();
  }, []);

  async function fetchHeroImages() {
    try {
      const response = await gatewayFetch("/api/admin/hero-images", {
        method: "GET",
        attachAccessToken: true,
      });
      if (response.ok) {
        const json = await response.json();
        const items = Array.isArray(json) ? json : json?.data ?? [];
        setHeroImages(items);
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (image?: HeroImage) => {
    if (image) {
      setEditingImage(image);
      setFormData(image);
    } else {
      setEditingImage(null);
      setFormData({
        active: true,
        order: heroImages.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const url = editingImage
      ? `/api/admin/hero-images/${editingImage.id}`
      : "/api/admin/hero-images";

    const method = editingImage ? "PUT" : "POST";

    try {
      const response = await gatewayFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        attachAccessToken: true,
      });

      if (response.ok) {
        toast.success(
          editingImage ? "Cập nhật thành công!" : "Thêm ảnh thành công!"
        );
        setIsDialogOpen(false);
        fetchHeroImages();
      } else {
        const error = await response.json();
        toast.error(error.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving hero image:", error);
      toast.error("Không thể lưu ảnh");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      const response = await gatewayFetch(`/api/admin/hero-images/${id}`, {
        method: "DELETE",
        attachAccessToken: true,
      });

      if (response.ok) {
        toast.success("Đã xóa ảnh");
        fetchHeroImages();
      } else {
        toast.error("Không thể xóa ảnh");
      }
    } catch (error) {
      console.error("Error deleting hero image:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleToggleActive = async (image: HeroImage) => {
    try {
      const response = await gatewayFetch(`/api/admin/hero-images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...image, active: !image.active }),
        attachAccessToken: true,
      });

      if (response.ok) {
        toast.success(image.active ? "Đã ẩn ảnh" : "Đã hiển thị ảnh");
        fetchHeroImages();
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleReorder = async (image: HeroImage, direction: "up" | "down") => {
    const newOrder = direction === "up" ? image.order - 1 : image.order + 1;

    if (newOrder < 0 || newOrder >= heroImages.length) return;

    try {
      const response = await gatewayFetch(`/api/admin/hero-images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...image, order: newOrder }),
        attachAccessToken: true,
      });

      if (response.ok) {
        fetchHeroImages();
      }
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý ảnh trang chủ
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý ảnh banner/hero hiển thị ở trang chủ
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm ảnh mới
        </Button>
      </div>

      {heroImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Chưa có ảnh nào</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              Thêm ảnh đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {heroImages.map((image, index) => (
            <Card key={image.id} className={!image.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{image.title}</CardTitle>
                    {image.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">
                        {image.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(image, "up")}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(image, "down")}
                      disabled={index === heroImages.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Thứ tự:</span>
                    <span className="font-medium">{image.order}</span>
                  </div>
                  {image.buttonText && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Nút CTA:</span>
                      <span className="font-medium">{image.buttonText}</span>
                    </div>
                  )}
                  {image.buttonLink && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Link:</span>
                      <span className="font-medium text-blue-600 truncate">
                        {image.buttonLink}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(image)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant={image.active ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(image)}
                  >
                    {image.active ? "Ẩn" : "Hiện"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? "Chỉnh sửa ảnh" : "Thêm ảnh mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin cho ảnh banner/hero trang chủ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Đặt Phòng Khách Sạn Tuyệt Vời"
                required
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Mô tả phụ</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="VD: Trải nghiệm kỳ nghỉ hoàn hảo với giá tốt nhất"
                rows={2}
              />
            </div>

            <div>
              <Label className="mb-3 block">Ảnh banner *</Label>
              <ImageUpload
                value={formData.imageUrl ? [formData.imageUrl] : []}
                onChange={(urls) =>
                  setFormData({ ...formData, imageUrl: urls[0] })
                }
                maxImages={1}
              />
              <p className="text-xs text-gray-500 mt-2">
                Khuyến nghị: 1920x600px hoặc tỷ lệ 16:5
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonText">Text nút CTA</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonText: e.target.value })
                  }
                  placeholder="VD: Đặt phòng ngay"
                />
              </div>

              <div>
                <Label htmlFor="buttonLink">Link nút CTA</Label>
                <Input
                  id="buttonLink"
                  value={formData.buttonLink || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonLink: e.target.value })
                  }
                  placeholder="/rooms"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="order">Thứ tự hiển thị</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || 0}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                min={0}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked as boolean })
                }
              />
              <Label htmlFor="active" className="cursor-pointer">
                Hiển thị ảnh này
              </Label>
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
                {editingImage ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
