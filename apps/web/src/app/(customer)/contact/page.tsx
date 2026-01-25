import { MainLayout } from "@/components/layout/main-layout";
import { ContactForm } from "@/components/customer/contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Điện thoại</h3>
                    <p className="text-muted-foreground">+84 123 456 789</p>
                    <p className="text-muted-foreground">+84 987 654 321</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@travelbook.com</p>
                    <p className="text-muted-foreground">info@travelbook.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Địa chỉ</h3>
                    <p className="text-muted-foreground">
                      123 Đường ABC, Quận 1<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                    <p className="text-muted-foreground">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                    <p className="text-muted-foreground">Thứ 7 - CN: 9:00 - 17:00</p>
                    <p className="text-sm text-primary mt-2">Hỗ trợ 24/7 qua hotline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <ContactForm />
            </div>
          </div>

          {/* Map or Additional Info */}
          <div className="mt-12 p-8 bg-muted rounded-lg">
            <h3 className="text-xl font-bold mb-4">Câu hỏi thường gặp</h3>
            <p className="text-muted-foreground">
              Bạn có thể tìm câu trả lời cho các câu hỏi thường gặp tại{" "}
              <a href="/faq" className="text-primary hover:underline">trang FAQ</a> của chúng tôi.
              Hoặc liên hệ trực tiếp với đội ngũ hỗ trợ để được giải đáp nhanh chóng.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
