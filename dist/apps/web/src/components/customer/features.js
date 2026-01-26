import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Shield, CreditCard, Clock, HeadphonesIcon } from "lucide-react";
export function Features() {
    const features = [
        {
            icon: Shield,
            title: "Đảm bảo giá tốt nhất",
            description: "Chúng tôi cam kết mang đến giá tốt nhất cho bạn",
        },
        {
            icon: CreditCard,
            title: "Thanh toán an toàn",
            description: "Hỗ trợ nhiều phương thức thanh toán bảo mật",
        },
        {
            icon: Clock,
            title: "Đặt phòng nhanh chóng",
            description: "Chỉ vài phút để hoàn tất đặt phòng",
        },
        {
            icon: HeadphonesIcon,
            title: "Hỗ trợ 24/7",
            description: "Đội ngũ hỗ trợ khách hàng luôn sẵn sàng",
        },
    ];
    return (_jsx("section", { className: "py-16", children: _jsx("div", { className: "container", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: features.map((feature, index) => (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(feature.icon, { className: "h-8 w-8 text-primary" }) }), _jsx("h3", { className: "text-lg font-semibold", children: feature.title }), _jsx("p", { className: "text-muted-foreground text-sm", children: feature.description })] }, index))) }) }) }));
}
//# sourceMappingURL=features.js.map