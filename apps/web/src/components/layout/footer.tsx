import Link from "next/link";
import { Hotel, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Hotel className="h-6 w-6" />
              <span className="font-bold text-xl">TravelBook</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hệ thống đặt phòng khách sạn & du lịch hàng đầu Việt Nam. 
              Đặt phòng nhanh chóng, giá tốt nhất.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/rooms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tìm phòng
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/booking-guide"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Hướng dẫn đặt phòng
                </Link>
              </li>
              <li>
                <Link
                  href="/payment"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>1900 2468</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@travelbook.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 TravelBook. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with ❤️ in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
