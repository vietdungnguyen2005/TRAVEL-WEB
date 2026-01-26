"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";
function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Token không hợp lệ");
            return;
        }
        const verifyEmail = async () => {
            try {
                const response = await gatewayFetch("/api/auth/verify-email", {
                    method: "POST",
                    body: JSON.stringify({ token }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Verification failed");
                }
                setStatus("success");
                setMessage("Email đã được xác thực thành công!");
                toast.success("Email verified successfully!");
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            }
            catch (error) {
                setStatus("error");
                setMessage(error.message || "Xác thực thất bại");
                toast.error(error.message);
            }
        };
        verifyEmail();
    }, [token, router]);
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [status === "loading" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Loader2, { className: "h-6 w-6 text-blue-600 animate-spin" }) }), _jsx(CardTitle, { children: "\u0110ang x\u00E1c th\u1EF1c..." }), _jsx(CardDescription, { children: "Vui l\u00F2ng \u0111\u1EE3i trong gi\u00E2y l\u00E1t" })] })), status === "success" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4", children: _jsx(CheckCircle2, { className: "h-6 w-6 text-green-600" }) }), _jsx(CardTitle, { children: "X\u00E1c th\u1EF1c th\u00E0nh c\u00F4ng!" }), _jsx(CardDescription, { children: message })] })), status === "error" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(XCircle, { className: "h-6 w-6 text-red-600" }) }), _jsx(CardTitle, { children: "X\u00E1c th\u1EF1c th\u1EA5t b\u1EA1i" }), _jsx(CardDescription, { children: message })] }))] }), _jsxs(CardContent, { className: "space-y-4", children: [status === "success" && (_jsx("p", { className: "text-sm text-center text-muted-foreground", children: "\u0110ang chuy\u1EC3n h\u01B0\u1EDBng \u0111\u1EBFn trang \u0111\u0103ng nh\u1EADp..." })), status === "error" && (_jsx("div", { className: "space-y-2", children: _jsx(Link, { href: "/auth/login", children: _jsx(Button, { variant: "outline", className: "w-full", children: "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp" }) }) }))] })] }) }));
}
export default function VerifyEmailPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }), children: _jsx(VerifyEmailContent, {}) }));
}
//# sourceMappingURL=page.js.map