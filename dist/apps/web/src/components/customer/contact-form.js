"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
export function ContactForm() {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            subject: formData.get("subject"),
            message: formData.get("message"),
        };
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Gửi tin nhắn thành công!", {
            description: "Chúng tôi sẽ phản hồi bạn trong vòng 24h"
        });
        // Reset form
        e.currentTarget.reset();
        setLoading(false);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "H\u1ECD v\u00E0 t\u00EAn" }), _jsx(Input, { id: "name", name: "name", placeholder: "Nh\u1EADp h\u1ECD v\u00E0 t\u00EAn c\u1EE7a b\u1EA1n", required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "your@email.com", required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsx(Input, { id: "phone", name: "phone", type: "tel", placeholder: "+84 123 456 789", disabled: loading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "subject", children: "Ch\u1EE7 \u0111\u1EC1" }), _jsx(Input, { id: "subject", name: "subject", placeholder: "Ch\u1EE7 \u0111\u1EC1 tin nh\u1EAFn", required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "message", children: "N\u1ED9i dung" }), _jsx(Textarea, { id: "message", name: "message", placeholder: "Nh\u1EADp n\u1ED9i dung tin nh\u1EAFn c\u1EE7a b\u1EA1n...", rows: 5, required: true, disabled: loading })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Đang gửi..." : "Gửi tin nhắn" })] }));
}
//# sourceMappingURL=contact-form.js.map