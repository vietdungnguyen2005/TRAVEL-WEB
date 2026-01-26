"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };
        if (data.password !== data.confirmPassword) {
            toast.error("Lỗi xác thực", {
                description: "Mật khẩu xác nhận không khớp"
            });
            setLoading(false);
            return;
        }
        if (data.password.length < 6) {
            toast.error("Mật khẩu yếu", {
                description: "Mật khẩu phải có ít nhất 6 ký tự"
            });
            setLoading(false);
            return;
        }
        try {
            const response = await gatewayFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Đăng ký thất bại");
            }
            toast.success("Đăng ký thành công!", {
                description: "Bạn có thể đăng nhập ngay bây giờ"
            });
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra. Vui lòng thử lại.";
            toast.error("Đăng ký thất bại", {
                description: message
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1 text-center", children: [_jsx("div", { className: "flex justify-center mb-2", children: _jsx("div", { className: "p-3 bg-primary/10 rounded-full", children: _jsx(Hotel, { className: "h-8 w-8 text-primary" }) }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "\u0110\u0103ng k\u00FD" }), _jsx(CardDescription, { children: "T\u1EA1o t\u00E0i kho\u1EA3n \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u \u0111\u1EB7t ph\u00F2ng" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "H\u1ECD v\u00E0 t\u00EAn" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "name", name: "name", type: "text", placeholder: "Nguy\u1EC5n V\u0103n A", className: "pl-10", required: true, disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "email@example.com", className: "pl-10", required: true, disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i (T\u00F9y ch\u1ECDn)" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "phone", name: "phone", type: "tel", placeholder: "0123456789", className: "pl-10", disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "pl-10", required: true, minLength: 6, disabled: loading })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u00CDt nh\u1EA5t 6 k\u00FD t\u1EF1" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "confirmPassword", name: "confirmPassword", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "pl-10", required: true, minLength: 6, disabled: loading })] })] }), _jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [loading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110\u0103ng k\u00FD"] })] }) }), _jsx(CardFooter, { className: "flex justify-center", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n?", " ", _jsx(Link, { href: "/auth/login", className: "text-primary hover:underline", children: "\u0110\u0103ng nh\u1EADp" })] }) })] }) }));
}
//# sourceMappingURL=page.js.map