import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export const metadata = {
    title: "TravelBook - Hệ thống đặt phòng khách sạn",
    description: "Đặt phòng khách sạn nhanh chóng, giá tốt nhất. Trải nghiệm kỳ nghỉ hoàn hảo.",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsxs("body", { className: `${geistSans.variable} ${geistMono.variable} antialiased`, children: [_jsx(Providers, { children: children }), _jsx(Toaster, {})] }) }));
}
//# sourceMappingURL=layout.js.map