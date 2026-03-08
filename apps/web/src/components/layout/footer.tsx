import Link from "next/link";
import { Hotel, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react";

const quickLinks = [
  { href: "/rooms", label: "Tìm phòng" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/blog", label: "Blog du lịch" },
  { href: "/terms", label: "Điều khoản sử dụng" },
];

const supportLinks = [
  { href: "/faq", label: "Câu hỏi thường gặp" },
  { href: "/booking-guide", label: "Hướng dẫn đặt phòng" },
  { href: "/payment", label: "Phương thức thanh toán" },
  { href: "/privacy", label: "Chính sách bảo mật" },
  { href: "/cancellation-policy", label: "Chính sách hủy phòng" },
];

const socialLinks = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://youtube.com", icon: Youtube, label: "Youtube" },
];

const paymentMethods = ["Visa", "Mastercard", "VNPay", "MoMo", "ZaloPay"];

export function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.03_250)] text-white">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                <Hotel className="h-5 w-5 text-gold" />
              </div>
              <span className="font-bold text-2xl text-white">
                Travel<span className="text-gold">Book</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Hệ thống đặt phòng khách sạn & du lịch hàng đầu Việt Nam.
              Đặt phòng nhanh chóng, giá tốt nhất, dịch vụ chuyên nghiệp.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-gold text-white/70 hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-5">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider">
              Liên hệ
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span className="text-white/60">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span className="text-white/60">1900 2468</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span className="text-white/60">support@travelbook.vn</span>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="pt-2">
              <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
                Thanh toán
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-white/15 text-xs text-white/50 bg-white/5"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; 2026 TravelBook. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white/70 transition-colors">
              Điều khoản
            </Link>
            <Link href="/privacy" className="hover:text-white/70 transition-colors">
              Bảo mật
            </Link>
            <span>Made with ❤️ in Vietnam</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
