"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Hotel, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        try {
            const res = await gatewayFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error("Đăng nhập thất bại", {
                    description: data?.message || "Email hoặc mật khẩu không đúng",
                });
                return;
            }
            // Expected payload: { accessToken, user }
            const token = data?.accessToken;
            if (token) {
                document.cookie = `access_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
            }
            toast.success("Đăng nhập thành công!", {
                description: `Chào mừng ${data?.user?.name || data?.user?.email || email}`,
            });
            if (data?.user?.role === "ADMIN") {
                router.push("/admin");
            }
            else {
                router.push("/dashboard");
            }
            router.refresh();
        }
        catch (error) {
            toast.error("Lỗi hệ thống", {
                description: "Đã có lỗi xảy ra. Vui lòng thử lại."
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogleSignIn = async () => {
        toast.error("Chức năng chưa sẵn sàng", {
            description: "OAuth chưa được hỗ trợ vì đã loại bỏ NextAuth. Hãy dùng đăng nhập bằng email/mật khẩu.",
        });
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1 text-center", children: [_jsx("div", { className: "flex justify-center mb-2", children: _jsx("div", { className: "p-3 bg-primary/10 rounded-full", children: _jsx(Hotel, { className: "h-8 w-8 text-primary" }) }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "\u0110\u0103ng nh\u1EADp" }), _jsx(CardDescription, { children: "\u0110\u0103ng nh\u1EADp \u0111\u1EC3 qu\u1EA3n l\u00FD \u0111\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "email@example.com", className: "pl-10", required: true, disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "pl-10", required: true, disabled: loading })] })] }), _jsx("div", { className: "flex items-center justify-between", children: _jsx(Link, { href: "/auth/forgot-password", className: "text-sm text-primary hover:underline", children: "Qu\u00EAn m\u1EADt kh\u1EA9u?" }) }), _jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [loading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110\u0103ng nh\u1EADp"] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx(Separator, {}) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Ho\u1EB7c ti\u1EBFp t\u1EE5c v\u1EDBi" }) })] }), _jsxs(Button, { variant: "outline", className: "w-full", onClick: handleGoogleSignIn, disabled: loading, children: [_jsxs("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }), "Google"] })] }), _jsx(CardFooter, { className: "flex justify-center", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Ch\u01B0a c\u00F3 t\u00E0i kho\u1EA3n?", " ", _jsx(Link, { href: "/auth/register", className: "text-primary hover:underline", children: "\u0110\u0103ng k\u00FD ngay" })] }) })] }) }));
}
//# sourceMappingURL=page.js.map