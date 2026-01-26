"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
import Image from "next/image";
export default function HeroImagesPage() {
    const [heroImages, setHeroImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [formData, setFormData] = useState({
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
                const data = await response.json();
                setHeroImages(data);
            }
        }
        catch (error) {
            console.error("Error fetching hero images:", error);
            toast.error("Không thể tải danh sách ảnh");
        }
        finally {
            setLoading(false);
        }
    }
    const handleOpenDialog = (image) => {
        if (image) {
            setEditingImage(image);
            setFormData(image);
        }
        else {
            setEditingImage(null);
            setFormData({
                active: true,
                order: heroImages.length,
            });
        }
        setIsDialogOpen(true);
    };
    const handleSubmit = async (e) => {
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
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                toast.success(editingImage ? "Cập nhật thành công!" : "Thêm ảnh thành công!");
                setIsDialogOpen(false);
                fetchHeroImages();
            }
            else {
                const error = await response.json();
                toast.error(error.error || "Có lỗi xảy ra");
            }
        }
        catch (error) {
            console.error("Error saving hero image:", error);
            toast.error("Không thể lưu ảnh");
        }
    };
    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa ảnh này?"))
            return;
        try {
            const response = await gatewayFetch(`/api/admin/hero-images/${id}`, {
                method: "DELETE",
                attachAccessToken: true,
            });
            if (response.ok) {
                toast.success("Đã xóa ảnh");
                fetchHeroImages();
            }
            else {
                toast.error("Không thể xóa ảnh");
            }
        }
        catch (error) {
            console.error("Error deleting hero image:", error);
            toast.error("Có lỗi xảy ra");
        }
    };
    const handleToggleActive = async (image) => {
        try {
            const response = await gatewayFetch(`/api/admin/hero-images/${image.id}`, {
                method: "PUT",
                body: JSON.stringify({ ...image, active: !image.active }),
                attachAccessToken: true,
            });
            if (response.ok) {
                toast.success(image.active ? "Đã ẩn ảnh" : "Đã hiển thị ảnh");
                fetchHeroImages();
            }
        }
        catch (error) {
            console.error("Error toggling active:", error);
            toast.error("Có lỗi xảy ra");
        }
    };
    const handleReorder = async (image, direction) => {
        const currentIndex = heroImages.findIndex((img) => img.id === image.id);
        const newOrder = direction === "up" ? image.order - 1 : image.order + 1;
        if (newOrder < 0 || newOrder >= heroImages.length)
            return;
        try {
            const response = await gatewayFetch(`/api/admin/hero-images/${image.id}`, {
                method: "PUT",
                body: JSON.stringify({ ...image, order: newOrder }),
                attachAccessToken: true,
            });
            if (response.ok) {
                fetchHeroImages();
            }
        }
        catch (error) {
            console.error("Error reordering:", error);
            toast.error("Có lỗi xảy ra");
        }
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center p-8", children: "\u0110ang t\u1EA3i..." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Qu\u1EA3n l\u00FD \u1EA3nh trang ch\u1EE7" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Qu\u1EA3n l\u00FD \u1EA3nh banner/hero hi\u1EC3n th\u1ECB \u1EDF trang ch\u1EE7" })] }), _jsxs(Button, { onClick: () => handleOpenDialog(), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Th\u00EAm \u1EA3nh m\u1EDBi"] })] }), heroImages.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(ImageIcon, { className: "h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500", children: "Ch\u01B0a c\u00F3 \u1EA3nh n\u00E0o" }), _jsx(Button, { onClick: () => handleOpenDialog(), className: "mt-4", children: "Th\u00EAm \u1EA3nh \u0111\u1EA7u ti\u00EAn" })] }) })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: heroImages.map((image, index) => (_jsxs(Card, { className: !image.active ? "opacity-60" : "", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-lg", children: image.title }), image.subtitle && (_jsx("p", { className: "text-sm text-gray-500 mt-1", children: image.subtitle }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleReorder(image, "up"), disabled: index === 0, children: _jsx(MoveUp, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleReorder(image, "down"), disabled: index === heroImages.length - 1, children: _jsx(MoveDown, { className: "h-4 w-4" }) })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "relative aspect-video rounded-lg overflow-hidden", children: _jsx(Image, { src: image.imageUrl, alt: image.title, fill: true, className: "object-cover", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }) }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500", children: "Th\u1EE9 t\u1EF1:" }), _jsx("span", { className: "font-medium", children: image.order })] }), image.buttonText && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500", children: "N\u00FAt CTA:" }), _jsx("span", { className: "font-medium", children: image.buttonText })] })), image.buttonLink && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500", children: "Link:" }), _jsx("span", { className: "font-medium text-blue-600 truncate", children: image.buttonLink })] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => handleOpenDialog(image), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "S\u1EEDa"] }), _jsx(Button, { variant: image.active ? "secondary" : "default", size: "sm", className: "flex-1", onClick: () => handleToggleActive(image), children: image.active ? "Ẩn" : "Hiện" }), _jsx(Button, { variant: "destructive", size: "sm", onClick: () => handleDelete(image.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] })] }, image.id))) })), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingImage ? "Chỉnh sửa ảnh" : "Thêm ảnh mới" }), _jsx(DialogDescription, { children: "\u0110i\u1EC1n th\u00F4ng tin cho \u1EA3nh banner/hero trang ch\u1EE7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "title", children: "Ti\u00EAu \u0111\u1EC1 *" }), _jsx(Input, { id: "title", value: formData.title || "", onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "VD: \u0110\u1EB7t Ph\u00F2ng Kh\u00E1ch S\u1EA1n Tuy\u1EC7t V\u1EDDi", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "subtitle", children: "M\u00F4 t\u1EA3 ph\u1EE5" }), _jsx(Textarea, { id: "subtitle", value: formData.subtitle || "", onChange: (e) => setFormData({ ...formData, subtitle: e.target.value }), placeholder: "VD: Tr\u1EA3i nghi\u1EC7m k\u1EF3 ngh\u1EC9 ho\u00E0n h\u1EA3o v\u1EDBi gi\u00E1 t\u1ED1t nh\u1EA5t", rows: 2 })] }), _jsxs("div", { children: [_jsx(Label, { className: "mb-3 block", children: "\u1EA2nh banner *" }), _jsx(ImageUpload, { value: formData.imageUrl ? [formData.imageUrl] : [], onChange: (urls) => setFormData({ ...formData, imageUrl: urls[0] }), maxImages: 1 }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Khuy\u1EBFn ngh\u1ECB: 1920x600px ho\u1EB7c t\u1EF7 l\u1EC7 16:5" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buttonText", children: "Text n\u00FAt CTA" }), _jsx(Input, { id: "buttonText", value: formData.buttonText || "", onChange: (e) => setFormData({ ...formData, buttonText: e.target.value }), placeholder: "VD: \u0110\u1EB7t ph\u00F2ng ngay" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buttonLink", children: "Link n\u00FAt CTA" }), _jsx(Input, { id: "buttonLink", value: formData.buttonLink || "", onChange: (e) => setFormData({ ...formData, buttonLink: e.target.value }), placeholder: "/rooms" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "order", children: "Th\u1EE9 t\u1EF1 hi\u1EC3n th\u1ECB" }), _jsx(Input, { id: "order", type: "number", value: formData.order || 0, onChange: (e) => setFormData({ ...formData, order: parseInt(e.target.value) }), min: 0 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "active", checked: formData.active, onCheckedChange: (checked) => setFormData({ ...formData, active: checked }) }), _jsx(Label, { htmlFor: "active", className: "cursor-pointer", children: "Hi\u1EC3n th\u1ECB \u1EA3nh n\u00E0y" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), children: "H\u1EE7y" }), _jsx(Button, { type: "submit", children: editingImage ? "Cập nhật" : "Thêm mới" })] })] })] }) })] }));
}
//# sourceMappingURL=page.js.map