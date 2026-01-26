"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export default function ChangePasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }
        setIsLoading(true);
        try {
            const response = await gatewayFetch("/api/user/change-password", {
                method: "POST",
                attachAccessToken: true,
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to change password");
            }
            toast.success("Đổi mật khẩu thành công!");
            // Reset form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            // Redirect after success
            setTimeout(() => {
                router.push("/dashboard/profile");
            }, 1500);
        }
        catch (error) {
            toast.error(error.message || "Có lỗi xảy ra");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "container max-w-2xl mx-auto py-8 px-4", children: [_jsxs(Link, { href: "/dashboard/profile", className: "inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Quay l\u1EA1i h\u1ED3 s\u01A1"] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" }), _jsx(CardDescription, { children: "C\u1EADp nh\u1EADt m\u1EADt kh\u1EA9u c\u1EE7a b\u1EA1n \u0111\u1EC3 b\u1EA3o m\u1EADt t\u00E0i kho\u1EA3n" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "currentPassword", children: [_jsx(Lock, { className: "inline h-4 w-4 mr-2" }), "M\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i"] }), _jsx(Input, { id: "currentPassword", type: "password", value: formData.currentPassword, onChange: (e) => setFormData({ ...formData, currentPassword: e.target.value }), placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i", disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "newPassword", children: [_jsx(Lock, { className: "inline h-4 w-4 mr-2" }), "M\u1EADt kh\u1EA9u m\u1EDBi"] }), _jsx(Input, { id: "newPassword", type: "password", value: formData.newPassword, onChange: (e) => setFormData({ ...formData, newPassword: e.target.value }), placeholder: "\u00CDt nh\u1EA5t 8 k\u00FD t\u1EF1", disabled: isLoading, required: true, minLength: 8 })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "confirmPassword", children: [_jsx(Lock, { className: "inline h-4 w-4 mr-2" }), "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u m\u1EDBi"] }), _jsx(Input, { id: "confirmPassword", type: "password", value: formData.confirmPassword, onChange: (e) => setFormData({ ...formData, confirmPassword: e.target.value }), placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u m\u1EDBi", disabled: isLoading, required: true, minLength: 8 })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : ("Đổi mật khẩu") }) })] }) })] })] }));
}
//# sourceMappingURL=page.js.map