"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, Mail, Phone, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { gatewayFetch } from "@/lib/gateway-client";
function getRoleColor(role) {
    switch (role) {
        case "ADMIN":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "USER":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
}
function getRoleText(role) {
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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [updating, setUpdating] = useState(null);
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
        }
        catch (error) {
            console.error("Error fetching users:", error);
        }
        finally {
            setLoading(false);
        }
    }
    async function updateUserRole(userId, newRole) {
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
            }
            else {
                alert("Không thể cập nhật vai trò");
            }
        }
        catch (error) {
            console.error("Error updating role:", error);
            alert("Đã xảy ra lỗi");
        }
        finally {
            setUpdating(null);
        }
    }
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Qu\u1EA3n l\u00FD ng\u01B0\u1EDDi d\u00F9ng" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Xem v\u00E0 qu\u1EA3n l\u00FD t\u1EA5t c\u1EA3 ng\u01B0\u1EDDi d\u00F9ng trong h\u1EC7 th\u1ED1ng" })] }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { placeholder: "T\u00ECm theo email ho\u1EB7c t\u00EAn...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: roleFilter, onValueChange: setRoleFilter, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "T\u1EA5t c\u1EA3 vai tr\u00F2" }), _jsx(SelectItem, { value: "USER", children: "Ng\u01B0\u1EDDi d\u00F9ng" }), _jsx(SelectItem, { value: "ADMIN", children: "Qu\u1EA3n tr\u1ECB vi\u00EAn" })] })] })] }) }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-gray-500 mt-4", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] })) : filteredUsers.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(User, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng t\u00ECm th\u1EA5y ng\u01B0\u1EDDi d\u00F9ng n\u00E0o" })] }) })) : (_jsx("div", { className: "grid gap-6", children: filteredUsers.map((user) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-6", children: [_jsxs(Avatar, { className: "w-16 h-16", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` }), _jsx(AvatarFallback, { children: user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase() })] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: user.name || "Chưa cập nhật tên" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs(Badge, { className: getRoleColor(user.role), children: [_jsx(Shield, { className: "w-3 h-3 mr-1" }), getRoleText(user.role)] }), _jsxs("span", { className: "text-sm text-gray-500", children: [user._count.bookings, " \u0111\u1EB7t ph\u00F2ng"] })] })] }) }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-700", children: user.email })] }), user.phone && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Phone, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-700", children: user.phone })] })), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { className: "text-gray-500", children: ["Tham gia: ", format(new Date(user.createdAt), "dd/MM/yyyy")] })] })] }), _jsx("div", { className: "flex items-end justify-end", children: user.role === "USER" ? (_jsx(Button, { variant: "outline", size: "sm", onClick: () => updateUserRole(user.id, "ADMIN"), disabled: updating === user.id, children: updating === user.id
                                                            ? "Đang xử lý..."
                                                            : "Nâng cấp Admin" })) : (_jsx(Button, { variant: "outline", size: "sm", onClick: () => updateUserRole(user.id, "USER"), disabled: updating === user.id, children: updating === user.id
                                                            ? "Đang xử lý..."
                                                            : "Hạ xuống User" })) })] })] })] }) }) }, user.id))) }))] }));
}
//# sourceMappingURL=page.js.map