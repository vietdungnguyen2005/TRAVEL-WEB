"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, Mail, Phone, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "USER":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getRoleText(role: string) {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "USER":
      return "Người dùng";
    default:
      return role;
  }
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await gatewayFetch("/api/admin/users", {
        method: "GET",
        attachAccessToken: true,
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    if (!confirm(`Bạn có chắc muốn thay đổi vai trò người dùng này?`)) {
      return;
    }

    try {
      setUpdating(userId);
      const response = await gatewayFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
        attachAccessToken: true,
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert("Không thể cập nhật vai trò");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setUpdating(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-gray-500 mt-2">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo email hoặc tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                <SelectItem value="USER">Người dùng</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name || "Chưa cập nhật tên"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(user.role)}>
                            <Shield className="w-3 h-3 mr-1" />
                            {getRoleText(user.role)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {user._count.bookings} đặt phòng
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">
                            Tham gia: {format(new Date(user.createdAt), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-end">
                        {user.role === "USER" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, "ADMIN")}
                            disabled={updating === user.id}
                          >
                            {updating === user.id
                              ? "Đang xử lý..."
                              : "Nâng cấp Admin"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, "USER")}
                            disabled={updating === user.id}
                          >
                            {updating === user.id
                              ? "Đang xử lý..."
                              : "Hạ xuống User"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
