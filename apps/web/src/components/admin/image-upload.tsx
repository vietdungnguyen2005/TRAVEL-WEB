"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Check max images limit
      if (value.length + files.length > maxImages) {
        toast.error("Vượt quá số lượng ảnh", {
          description: `Bạn chỉ có thể upload tối đa ${maxImages} ảnh`,
        });
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          // Validate file type
          if (!file.type.startsWith("image/")) {
            throw new Error(`${file.name} không phải là file ảnh`);
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`${file.name} quá lớn (tối đa 5MB)`);
          }

          const formData = new FormData();
          formData.append("file", file);

          const response = await gatewayFetch("/api/upload/image", {
            method: "POST",
            body: formData,
            headers: {},
            attachAccessToken: true,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
          }

          const data = await response.json();
          return data.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onChange([...value, ...uploadedUrls]);

        toast.success("Upload thành công!", {
          description: `Đã upload ${uploadedUrls.length} ảnh`,
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Upload thất bại", {
          description: error.message || "Vui lòng thử lại",
        });
      } finally {
        setUploading(false);
        // Reset input
        e.target.value = "";
      }
    },
    [value, onChange, maxImages]
  );

  const handleRemove = useCallback(
    (urlToRemove: string) => {
      onChange(value.filter((url) => url !== urlToRemove));
      toast.success("Đã xóa ảnh");
    },
    [value, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading || value.length >= maxImages}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload ảnh
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxImages} ảnh
        </span>
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(url)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4" />
            <p className="text-sm">Chưa có ảnh nào</p>
            <p className="text-xs">Click "Upload ảnh" để thêm</p>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Hỗ trợ: JPG, PNG, GIF • Tối đa 5MB/ảnh • Tối đa {maxImages} ảnh
      </p>
    </div>
  );
}
