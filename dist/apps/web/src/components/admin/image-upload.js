"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export function ImageUpload({ value = [], onChange, maxImages = 5, disabled = false, }) {
    const [uploading, setUploading] = useState(false);
    const handleUpload = useCallback(async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0)
            return;
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
        }
        catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload thất bại", {
                description: error.message || "Vui lòng thử lại",
            });
        }
        finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    }, [value, onChange, maxImages]);
    const handleRemove = useCallback((urlToRemove) => {
        onChange(value.filter((url) => url !== urlToRemove));
        toast.success("Đã xóa ảnh");
    }, [value, onChange]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { type: "button", variant: "outline", disabled: disabled || uploading || value.length >= maxImages, onClick: () => document.getElementById("image-upload")?.click(), children: uploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang upload..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Upload \u1EA3nh"] })) }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [value.length, "/", maxImages, " \u1EA3nh"] })] }), _jsx("input", { id: "image-upload", type: "file", accept: "image/*", multiple: true, onChange: handleUpload, className: "hidden", disabled: disabled || uploading }), value.length > 0 ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: value.map((url, index) => (_jsx(Card, { className: "relative group overflow-hidden", children: _jsxs("div", { className: "aspect-square relative", children: [_jsx(Image, { src: url, alt: `Upload ${index + 1}`, fill: true, className: "object-cover", sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" }), _jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: _jsx(Button, { type: "button", variant: "destructive", size: "icon", onClick: () => handleRemove(url), disabled: disabled, children: _jsx(X, { className: "h-4 w-4" }) }) })] }) }, index))) })) : (_jsx(Card, { className: "border-dashed", children: _jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground", children: [_jsx(ImageIcon, { className: "h-12 w-12 mb-4" }), _jsx("p", { className: "text-sm", children: "Ch\u01B0a c\u00F3 \u1EA3nh n\u00E0o" }), _jsx("p", { className: "text-xs", children: "Click \"Upload \u1EA3nh\" \u0111\u1EC3 th\u00EAm" })] }) })), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["H\u1ED7 tr\u1EE3: JPG, PNG, GIF \u2022 T\u1ED1i \u0111a 5MB/\u1EA3nh \u2022 T\u1ED1i \u0111a ", maxImages, " \u1EA3nh"] })] }));
}
//# sourceMappingURL=image-upload.js.map