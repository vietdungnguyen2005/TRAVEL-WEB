"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }
        setIsLoading(true);
        try {
            const response = await gatewayFetch("/api/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to send reset email");
            }
            setIsSuccess(true);
            toast.success("Email đặt lại mật khẩu đã được gửi!");
        }
        catch (error) {
            toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isSuccess) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Mail, { className: "h-6 w-6 text-green-600" }) }), _jsx(CardTitle, { children: "Ki\u1EC3m tra email c\u1EE7a b\u1EA1n" }), _jsxs(CardDescription, { children: ["Ch\u00FAng t\u00F4i \u0111\u00E3 g\u1EEDi link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u \u0111\u1EBFn ", _jsx("strong", { children: email })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Alert, { children: _jsx(AlertDescription, { children: "Link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u s\u1EBD h\u1EBFt h\u1EA1n sau 1 gi\u1EDD. N\u1EBFu b\u1EA1n kh\u00F4ng nh\u1EADn \u0111\u01B0\u1EE3c email, vui l\u00F2ng ki\u1EC3m tra th\u01B0 m\u1EE5c spam." }) }), _jsx(Link, { href: "/auth/login", className: "block", children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp"] }) })] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Qu\u00EAn m\u1EADt kh\u1EA9u?" }), _jsx(CardDescription, { children: "Nh\u1EADp email c\u1EE7a b\u1EA1n v\u00E0 ch\u00FAng t\u00F4i s\u1EBD g\u1EEDi link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "your@email.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang g\u1EEDi..."] })) : ("Gửi link đặt lại mật khẩu") }), _jsx("div", { className: "text-center", children: _jsxs(Link, { href: "/auth/login", className: "text-sm text-muted-foreground hover:text-primary", children: [_jsx(ArrowLeft, { className: "inline mr-1 h-3 w-3" }), "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp"] }) })] }) })] }) }));
}
//# sourceMappingURL=page.js.map