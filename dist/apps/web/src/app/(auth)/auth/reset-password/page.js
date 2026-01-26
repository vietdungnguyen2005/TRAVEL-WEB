"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gatewayFetch, gatewayUrl } from "@/lib/gateway-client";
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidToken, setIsValidToken] = useState(null);
    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            return;
        }
        // Verify token
        const verifyToken = async () => {
            try {
                const response = await fetch(gatewayUrl(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`));
                setIsValidToken(response.ok);
            }
            catch {
                setIsValidToken(false);
            }
        };
        verifyToken();
    }, [token]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }
        setIsLoading(true);
        try {
            const response = await gatewayFetch("/api/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }
            setIsSuccess(true);
            toast.success("Đặt lại mật khẩu thành công!");
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
        catch (error) {
            toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isValidToken === null) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    if (isValidToken === false) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(XCircle, { className: "h-6 w-6 text-red-600" }) }), _jsx(CardTitle, { children: "Link kh\u00F4ng h\u1EE3p l\u1EC7" }), _jsx(CardDescription, { children: "Link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u kh\u00F4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\u00E3 h\u1EBFt h\u1EA1n" })] }), _jsx(CardContent, { children: _jsx(Link, { href: "/auth/forgot-password", children: _jsx(Button, { className: "w-full", children: "Y\u00EAu c\u1EA7u link m\u1EDBi" }) }) })] }) }));
    }
    if (isSuccess) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4", children: _jsx(CheckCircle2, { className: "h-6 w-6 text-green-600" }) }), _jsx(CardTitle, { children: "Th\u00E0nh c\u00F4ng!" }), _jsx(CardDescription, { children: "M\u1EADt kh\u1EA9u c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c \u0111\u1EB7t l\u1EA1i th\u00E0nh c\u00F4ng" })] }), _jsx(CardContent, { children: _jsx(Alert, { children: _jsx(AlertDescription, { children: "\u0110ang chuy\u1EC3n h\u01B0\u1EDBng \u0111\u1EBFn trang \u0111\u0103ng nh\u1EADp..." }) }) })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" }), _jsx(CardDescription, { children: "Nh\u1EADp m\u1EADt kh\u1EA9u m\u1EDBi cho t\u00E0i kho\u1EA3n c\u1EE7a b\u1EA1n" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx(Input, { id: "password", type: "password", placeholder: "\u00CDt nh\u1EA5t 8 k\u00FD t\u1EF1", value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading, required: true, minLength: 8 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u" }), _jsx(Input, { id: "confirmPassword", type: "password", placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), disabled: isLoading, required: true, minLength: 8 })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : ("Đặt lại mật khẩu") })] }) })] }) }));
}
export default function ResetPasswordPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }), children: _jsx(ResetPasswordForm, {}) }));
}
//# sourceMappingURL=page.js.map