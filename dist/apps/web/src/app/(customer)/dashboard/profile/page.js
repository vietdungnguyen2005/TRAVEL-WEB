"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Lock, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClientLayout } from "@/components/layout/client-layout";
import { gatewayFetch } from "@/lib/gateway-client";
export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        image: null,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    useEffect(() => {
        (async () => {
            try {
                const res = await gatewayFetch("/api/user/profile", {
                    method: "GET",
                    attachAccessToken: true,
                });
                if (!res.ok)
                    return;
                const data = await res.json();
                setProfileData({
                    name: data?.name || "",
                    email: data?.email || "",
                    phone: data?.phone || "",
                    image: data?.image || null,
                });
            }
            catch {
                // ignore
            }
        })();
    }, []);
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await gatewayFetch("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify(profileData),
                attachAccessToken: true,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Update failed");
            }
            const data = await response.json();
            toast.success("Cập nhật thông tin thành công!");
        }
        catch (error) {
            toast.error("Cập nhật thất bại", {
                description: error.message,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Mật khẩu không khớp", {
                description: "Mật khẩu mới và xác nhận mật khẩu phải giống nhau",
            });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Mật khẩu yếu", {
                description: "Mật khẩu phải có ít nhất 6 ký tự",
            });
            return;
        }
        setLoading(true);
        try {
            const response = await gatewayFetch("/api/user/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
                attachAccessToken: true,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Change password failed");
            }
            toast.success("Đổi mật khẩu thành công!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
        catch (error) {
            toast.error("Đổi mật khẩu thất bại", {
                description: error.message,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith("image/")) {
            toast.error("File không hợp lệ", {
                description: "Vui lòng chọn file ảnh",
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn", {
                description: "Ảnh phải nhỏ hơn 5MB",
            });
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await gatewayFetch("/api/upload/image", {
                method: "POST",
                body: formData,
                // Let browser set multipart boundary.
                headers: {},
                attachAccessToken: true,
            });
            if (!response.ok) {
                throw new Error("Upload failed");
            }
            const data = await response.json();
            // Update profile with new avatar
            setProfileData({ ...profileData, image: data.url });
            // Auto save avatar
            const updateResponse = await gatewayFetch("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify({ image: data.url }),
                attachAccessToken: true,
            });
            if (updateResponse.ok) {
                toast.success("Cập nhật avatar thành công!");
            }
        }
        catch (error) {
            toast.error("Upload thất bại", {
                description: "Vui lòng thử lại",
            });
        }
        finally {
            setUploading(false);
            e.target.value = "";
        }
    };
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    return (_jsx(ClientLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Th\u00F4ng tin c\u00E1 nh\u00E2n" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("div", { className: "relative", children: [_jsxs(Avatar, { className: "h-32 w-32", children: [_jsx(AvatarImage, { src: profileData.image || undefined }), _jsx(AvatarFallback, { className: "text-2xl", children: profileData.name ? getInitials(profileData.name) : "U" })] }), _jsx(Button, { size: "icon", variant: "secondary", className: "absolute bottom-0 right-0 rounded-full", onClick: () => document.getElementById("avatar-upload")?.click(), disabled: uploading, children: uploading ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsx(Upload, { className: "h-4 w-4" })) }), _jsx("input", { id: "avatar-upload", type: "file", accept: "image/*", onChange: handleAvatarUpload, className: "hidden" })] }), _jsx("h3", { className: "mt-4 text-lg font-semibold", children: profileData.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: profileData.email }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Kh\u00E1ch h\u00E0ng" })] }) }) }), _jsxs(Card, { className: "md:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "C\u00E0i \u0111\u1EB7t t\u00E0i kho\u1EA3n" }), _jsx(CardDescription, { children: "Qu\u1EA3n l\u00FD th\u00F4ng tin c\u00E1 nh\u00E2n v\u00E0 b\u1EA3o m\u1EADt" })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "profile", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "profile", children: "Th\u00F4ng tin" }), _jsx(TabsTrigger, { value: "password", children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" })] }), _jsx(TabsContent, { value: "profile", className: "space-y-4 mt-4", children: _jsxs("form", { onSubmit: handleProfileUpdate, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "H\u1ECD v\u00E0 t\u00EAn" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "name", value: profileData.name, onChange: (e) => setProfileData({ ...profileData, name: e.target.value }), className: "pl-10", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", type: "email", value: profileData.email, className: "pl-10 bg-muted", disabled: true })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Email kh\u00F4ng th\u1EC3 thay \u0111\u1ED5i" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "phone", type: "tel", value: profileData.phone, onChange: (e) => setProfileData({ ...profileData, phone: e.target.value }), className: "pl-10", placeholder: "+84 123 456 789" })] })] }), _jsx(Separator, { className: "my-4" }), _jsx(Button, { type: "submit", disabled: loading, className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang c\u1EADp nh\u1EADt..."] })) : ("Cập nhật thông tin") })] }) }), _jsx(TabsContent, { value: "password", className: "space-y-4 mt-4", children: _jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "currentPassword", children: "M\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "currentPassword", type: "password", value: passwordData.currentPassword, onChange: (e) => setPasswordData({
                                                                                    ...passwordData,
                                                                                    currentPassword: e.target.value,
                                                                                }), className: "pl-10", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newPassword", children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "newPassword", type: "password", value: passwordData.newPassword, onChange: (e) => setPasswordData({
                                                                                    ...passwordData,
                                                                                    newPassword: e.target.value,
                                                                                }), className: "pl-10", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "confirmPassword", type: "password", value: passwordData.confirmPassword, onChange: (e) => setPasswordData({
                                                                                    ...passwordData,
                                                                                    confirmPassword: e.target.value,
                                                                                }), className: "pl-10", required: true })] })] }), _jsx(Separator, { className: "my-4" }), _jsx(Button, { type: "submit", disabled: loading, className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : ("Đổi mật khẩu") })] }) })] }) })] })] })] }) }) }));
}
//# sourceMappingURL=page.js.map