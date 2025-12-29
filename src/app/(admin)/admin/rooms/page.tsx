"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bed, Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";

interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomTypeId: string;
  roomType: {
    name: string;
    pricePerNight: number;
  };
}

interface RoomFormData {
  roomNumber: string;
  floor: number;
  status: string;
  roomTypeId: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function getStatusColor(status: string) {
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

function getStatusText(status: string) {
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
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
      const response = await fetch("/api/admin/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoomTypes() {
    try {
      const response = await fetch("/api/room-types");
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data);
      }
    } catch (error) {
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

  function openEditDialog(room: Room) {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomTypeId: room.roomTypeId,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
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
      } else {
        const error = await response.json();
        alert(error.error || "Không thể lưu phòng");
      }
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(roomId: string) {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || "Không thể xóa phòng");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Đã xảy ra lỗi");
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-gray-500 mt-2">
            Quản lý thông tin và trạng thái các phòng
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm phòng mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo số phòng hoặc loại phòng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                <SelectItem value="OCCUPIED">Đã đặt</SelectItem>
                <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                <SelectItem value="CLEANING">Đang dọn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy phòng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Phòng {room.roomNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Tầng {room.floor}
                    </p>
                  </div>
                  <Badge className={getStatusColor(room.status)}>
                    {getStatusText(room.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Loại phòng</p>
                    <p className="font-medium">{room.roomType.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giá mỗi đêm</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {formatCurrency(Number(room.roomType.pricePerNight))}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(room)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Cập nhật thông tin phòng"
                : "Nhập thông tin phòng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="roomNumber">Số phòng</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                  placeholder="101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor">Tầng</Label>
                <Input
                  id="floor"
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="roomTypeId">Loại phòng</Label>
                <Select
                  value={formData.roomTypeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roomTypeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {formatCurrency(Number(type.pricePerNight))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                    <SelectItem value="OCCUPIED">Đã đặt</SelectItem>
                    <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    <SelectItem value="CLEANING">Đang dọn</SelectItem>
                  </SelectContent>
                </Select>
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
