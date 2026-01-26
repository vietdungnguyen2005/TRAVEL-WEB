"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";
export default function EmailTestPage() {
    const [loading, setLoading] = useState(false);
    const [emailType, setEmailType] = useState("booking-confirmation");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const handleSendTestEmail = async () => {
        if (!email) {
            toast.error("Email không được để trống");
            return;
        }
        setLoading(true);
        try {
            const response = await gatewayFetch("/api/test/email", {
                method: "POST",
                body: JSON.stringify({
                    type: emailType,
                    email,
                    name: name || undefined,
                }),
                attachAccessToken: true,
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("Email đã được gửi thành công!", {
                    description: `Email ${emailType} đã được gửi đến ${email}`,
                    icon: _jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" }),
                });
            }
            else {
                throw new Error(data.error || "Failed to send email");
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Vui lòng kiểm tra cấu hình Resend API";
            console.error("Email test error:", error);
            toast.error("Gửi email thất bại", {
                description: message,
                icon: _jsx(XCircle, { className: "h-5 w-5 text-red-500" }),
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Email Testing" }), _jsx("p", { className: "text-muted-foreground", children: "Test email templates v\u00E0 x\u00E1c nh\u1EADn c\u1EA5u h\u00ECnh Resend API" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-5 w-5" }), "Send Test Email"] }), _jsx(CardDescription, { children: "G\u1EEDi email m\u1EABu \u0111\u1EC3 ki\u1EC3m tra templates v\u00E0 delivery" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "emailType", children: "Email Template" }), _jsxs(Select, { value: emailType, onValueChange: setEmailType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Ch\u1ECDn lo\u1EA1i email" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "booking-confirmation", children: "X\u00E1c nh\u1EADn \u0111\u1EB7t ph\u00F2ng" }), _jsx(SelectItem, { value: "check-in-reminder", children: "Nh\u1EAFc nh\u1EDF check-in" }), _jsx(SelectItem, { value: "cancellation", children: "X\u00E1c nh\u1EADn h\u1EE7y ph\u00F2ng" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email ng\u01B0\u1EDDi nh\u1EADn *" }), _jsx(Input, { id: "email", type: "email", placeholder: "your@email.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "T\u00EAn ng\u01B0\u1EDDi nh\u1EADn (t\u00F9y ch\u1ECDn)" }), _jsx(Input, { id: "name", type: "text", placeholder: "Nguy\u1EC5n V\u0103n A", value: name, onChange: (e) => setName(e.target.value) })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { onClick: handleSendTestEmail, disabled: loading || !email, className: "w-full", size: "lg", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "\u0110ang g\u1EEDi..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), "G\u1EEDi Email Test"] })) }) })] })] }), _jsxs(Card, { className: "mt-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "H\u01B0\u1EDBng d\u1EABn c\u1EA5u h\u00ECnh" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "1. L\u1EA5y Resend API Key" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Truy c\u1EADp", " ", _jsx("a", { href: "https://resend.com/api-keys", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: "resend.com/api-keys" }), " ", "\u0111\u1EC3 t\u1EA1o API key m\u1EDBi"] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "2. C\u1EA5u h\u00ECnh .env" }), _jsx("pre", { className: "bg-muted p-3 rounded text-sm overflow-x-auto", children: `RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"` })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "3. Verify Domain (Production)" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u0110\u1EC3 g\u1EEDi email t\u1EEB domain c\u1EE7a b\u1EA1n, c\u1EA7n verify domain t\u1EA1i Resend dashboard" })] }), _jsx("div", { className: "pt-2 border-t", children: _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\uD83D\uDCA1 Trong development, b\u1EA1n c\u00F3 th\u1EC3 s\u1EED d\u1EE5ng", " ", _jsx("code", { className: "bg-muted px-1 rounded", children: "onboarding@resend.dev" }), " ", "l\u00E0m FROM_EMAIL"] }) })] })] })] }) }));
}
//# sourceMappingURL=page.js.map