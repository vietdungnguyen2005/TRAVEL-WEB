import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MainLayout } from "@/components/layout/main-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
export default function FAQPage() {
    const faqs = [
        {
            question: "Làm thế nào để đặt phòng?",
            answer: "Bạn có thể đặt phòng dễ dàng bằng cách: 1) Chọn ngày nhận phòng và trả phòng, 2) Chọn loại phòng phù hợp, 3) Điền thông tin cá nhân, 4) Thanh toán và nhận xác nhận qua email.",
        },
        {
            question: "Tôi có thể hủy đặt phòng không?",
            answer: "Có, bạn có thể hủy đặt phòng miễn phí trước 24 giờ so với thời gian nhận phòng. Sau thời gian này, phí hủy sẽ được áp dụng theo chính sách của khách sạn.",
        },
        {
            question: "Các phương thức thanh toán được chấp nhận?",
            answer: "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ (Visa, MasterCard), ví điện tử (Momo, ZaloPay), và chuyển khoản ngân hàng.",
        },
        {
            question: "Thời gian nhận phòng và trả phòng là khi nào?",
            answer: "Thời gian nhận phòng: từ 14:00. Thời gian trả phòng: trước 12:00 trưa. Nếu bạn cần nhận phòng sớm hoặc trả phòng muộn, vui lòng liên hệ trước để được hỗ trợ.",
        },
        {
            question: "Tôi có thể thay đổi ngày đặt phòng không?",
            answer: "Có, bạn có thể thay đổi ngày đặt phòng tùy thuộc vào tình trạng phòng trống. Vui lòng liên hệ với chúng tôi ít nhất 48 giờ trước ngày nhận phòng.",
        },
        {
            question: "Khách sạn có chỗ đỗ xe không?",
            answer: "Có, chúng tôi cung cấp bãi đỗ xe miễn phí cho khách lưu trú. Bãi đỗ xe có bảo vệ 24/7.",
        },
        {
            question: "Tôi có được hoàn tiền nếu hủy đặt phòng?",
            answer: "Chính sách hoàn tiền phụ thuộc vào loại phòng và thời gian hủy. Hủy miễn phí trước 24h: hoàn 100%. Hủy trong vòng 24h: hoàn 50%. Không đến không báo: không hoàn tiền.",
        },
        {
            question: "Làm thế nào để liên hệ với khách sạn?",
            answer: "Bạn có thể liên hệ với chúng tôi qua: Hotline: +84 123 456 789, Email: support@travelbook.com, hoặc qua trang Liên hệ trên website.",
        },
        {
            question: "Khách sạn có wifi miễn phí không?",
            answer: "Có, tất cả các phòng đều được trang bị wifi tốc độ cao hoàn toàn miễn phí.",
        },
        {
            question: "Tôi có thể mang thú cưng không?",
            answer: "Hiện tại, chúng tôi chưa cho phép mang thú cưng vào khách sạn. Tuy nhiên, chúng tôi có thể giới thiệu các dịch vụ chăm sóc thú cưng gần đó.",
        },
    ];
    return (_jsx(MainLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-12", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold mb-4 text-center", children: "C\u00E2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p" }), _jsx("p", { className: "text-lg text-muted-foreground text-center mb-12", children: "T\u00ECm c\u00E2u tr\u1EA3 l\u1EDDi cho c\u00E1c c\u00E2u h\u1ECFi ph\u1ED5 bi\u1EBFn c\u1EE7a kh\u00E1ch h\u00E0ng" }), _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqs.map((faq, index) => (_jsxs(AccordionItem, { value: `item-${index}`, children: [_jsx(AccordionTrigger, { className: "text-left", children: faq.question }), _jsx(AccordionContent, { className: "text-muted-foreground", children: faq.answer })] }, index))) }), _jsxs("div", { className: "mt-12 p-6 bg-muted rounded-lg text-center", children: [_jsx("h3", { className: "text-xl font-bold mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y c\u00E2u tr\u1EA3 l\u1EDDi?" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "\u0110\u1ED9i ng\u0169 h\u1ED7 tr\u1EE3 c\u1EE7a ch\u00FAng t\u00F4i lu\u00F4n s\u1EB5n s\u00E0ng gi\u00FAp \u0111\u1EE1 b\u1EA1n" }), _jsx("a", { href: "/contact", children: _jsx("button", { className: "bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90", children: "Li\u00EAn h\u1EC7 v\u1EDBi ch\u00FAng t\u00F4i" }) })] })] }) }) }));
}
//# sourceMappingURL=page.js.map