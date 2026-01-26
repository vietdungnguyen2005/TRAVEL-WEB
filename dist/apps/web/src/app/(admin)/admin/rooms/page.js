"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { gatewayFetch } from "@/lib/gateway-client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Bed, Plus, Edit, Trash2, Search } from "lucide-react";
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}
function getStatusColor(status) {
    switch (status) {
        case "AVAILABLE":
            return "bg-green-100 text-green-800 border-green-200";
        case "OCCUPIED":
            return "bg-red-100 text-red-800 border-red-200";
        case "MAINTENANCE":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "CLEANING":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
}
function getStatusText(status) {
    switch (status) {
        case "AVAILABLE":
            return "Sẵn sàng";
        case "OCCUPIED":
            return "Đã đặt";
        case "MAINTENANCE":
            return "Bảo trì";
        case "CLEANING":
            return "Đang dọn";
        default:
            return status;
    }
}
export default function RoomsManagement() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: "",
        floor: 1,
        status: "AVAILABLE",
        roomTypeId: "",
    });
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchRooms();
        fetchRoomTypes();
    }, []);
    async function fetchRooms() {
        try {
            setLoading(true);
            const response = await gatewayFetch("/api/admin/rooms", {
                method: "GET",
                attachAccessToken: true,
            });
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        }
        catch (error) {
            console.error("Error fetching rooms:", error);
        }
        finally {
            setLoading(false);
        }
    }
    async function fetchRoomTypes() {
        try {
            const response = await gatewayFetch("/api/admin/room-types", {
                method: "GET",
                attachAccessToken: true,
            });
            if (response.ok) {
                const data = await response.json();
                setRoomTypes(data);
            }
        }
        catch (error) {
            console.error("Error fetching room types:", error);
        }
    }
    function openCreateDialog() {
        setEditingRoom(null);
        setFormData({
            roomNumber: "",
            floor: 1,
            status: "AVAILABLE",
            roomTypeId: roomTypes[0]?.id || "",
        });
        setIsDialogOpen(true);
    }
    function openEditDialog(room) {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            floor: room.floor,
            status: room.status,
            roomTypeId: room.roomTypeId,
        });
        setIsDialogOpen(true);
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingRoom
                ? `/api/admin/rooms/${editingRoom.id}`
                : "/api/admin/rooms";
            const method = editingRoom ? "PATCH" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                await fetchRooms();
                setIsDialogOpen(false);
            }
            else {
                const error = await response.json();
                alert(error.error || "Không thể lưu phòng");
            }
        }
        catch (error) {
            console.error("Error saving room:", error);
            alert("Đã xảy ra lỗi");
        }
        finally {
            setSubmitting(false);
        }
    }
    async function handleDelete(roomId) {
        if (!confirm("Bạn có chắc muốn xóa phòng này?")) {
            return;
        }
        try {
            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                await fetchRooms();
            }
            else {
                const error = await response.json();
                alert(error.error || "Không thể xóa phòng");
            }
        }
        catch (error) {
            console.error("Error deleting room:", error);
            alert("Đã xảy ra lỗi");
        }
    }
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.roomType.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Qu\u1EA3n l\u00FD ph\u00F2ng" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Qu\u1EA3n l\u00FD th\u00F4ng tin v\u00E0 tr\u1EA1ng th\u00E1i c\u00E1c ph\u00F2ng" })] }), _jsxs(Button, { onClick: openCreateDialog, className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Th\u00EAm ph\u00F2ng m\u1EDBi"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { placeholder: "T\u00ECm theo s\u1ED1 ph\u00F2ng ho\u1EB7c lo\u1EA1i ph\u00F2ng...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\u00E1i" }), _jsx(SelectItem, { value: "AVAILABLE", children: "S\u1EB5n s\u00E0ng" }), _jsx(SelectItem, { value: "OCCUPIED", children: "\u0110\u00E3 \u0111\u1EB7t" }), _jsx(SelectItem, { value: "MAINTENANCE", children: "B\u1EA3o tr\u00EC" }), _jsx(SelectItem, { value: "CLEANING", children: "\u0110ang d\u1ECDn" })] })] })] }) }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] })) : filteredRooms.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Bed, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng t\u00ECm th\u1EA5y ph\u00F2ng n\u00E0o" })] }) })) : (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredRooms.map((room) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-xl", children: ["Ph\u00F2ng ", room.roomNumber] }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["T\u1EA7ng ", room.floor] })] }), _jsx(Badge, { className: getStatusColor(room.status), children: getStatusText(room.status) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Lo\u1EA1i ph\u00F2ng" }), _jsx("p", { className: "font-medium", children: room.roomType.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Gi\u00E1 m\u1ED7i \u0111\u00EAm" }), _jsx("p", { className: "font-semibold text-lg text-blue-600", children: formatCurrency(Number(room.roomType.pricePerNight)) })] }), _jsxs("div", { className: "flex gap-2 pt-3 border-t", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => openEditDialog(room), children: [_jsx(Edit, { className: "w-4 h-4 mr-1" }), "S\u1EEDa"] }), _jsx(Button, { variant: "destructive", size: "sm", onClick: () => handleDelete(room.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) })] }, room.id))) })), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới" }), _jsx(DialogDescription, { children: editingRoom
                                        ? "Cập nhật thông tin phòng"
                                        : "Nhập thông tin phòng mới" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "roomNumber", children: "S\u1ED1 ph\u00F2ng" }), _jsx(Input, { id: "roomNumber", value: formData.roomNumber, onChange: (e) => setFormData({ ...formData, roomNumber: e.target.value }), placeholder: "101", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "floor", children: "T\u1EA7ng" }), _jsx(Input, { id: "floor", type: "number", min: "1", value: formData.floor, onChange: (e) => setFormData({ ...formData, floor: parseInt(e.target.value) }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "roomTypeId", children: "Lo\u1EA1i ph\u00F2ng" }), _jsxs(Select, { value: formData.roomTypeId, onValueChange: (value) => setFormData({ ...formData, roomTypeId: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Ch\u1ECDn lo\u1EA1i ph\u00F2ng" }) }), _jsx(SelectContent, { children: roomTypes.map((type) => (_jsxs(SelectItem, { value: type.id, children: [type.name, " - ", formatCurrency(Number(type.pricePerNight))] }, type.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "status", children: "Tr\u1EA1ng th\u00E1i" }), _jsxs(Select, { value: formData.status, onValueChange: (value) => setFormData({ ...formData, status: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "AVAILABLE", children: "S\u1EB5n s\u00E0ng" }), _jsx(SelectItem, { value: "OCCUPIED", children: "\u0110\u00E3 \u0111\u1EB7t" }), _jsx(SelectItem, { value: "MAINTENANCE", children: "B\u1EA3o tr\u00EC" }), _jsx(SelectItem, { value: "CLEANING", children: "\u0110ang d\u1ECDn" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), children: "H\u1EE7y" }), _jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Đang lưu..." : "Lưu" })] })] })] }) })] }));
}
//# sourceMappingURL=page.js.map