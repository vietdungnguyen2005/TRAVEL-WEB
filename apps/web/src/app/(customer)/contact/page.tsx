import { MainLayout } from "@/components/layout/main-layout";
import { ContactForm } from "@/components/customer/contact-form";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const contactInfo = [
  {
    icon: Phone,
    title: "Điện thoại",
    details: ["+84 123 456 789", "+84 987 654 321"],
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["support@travelbook.vn", "info@travelbook.vn"],
    color: "bg-green-50 text-green-600",
  },
  {
    icon: MapPin,
    title: "Địa chỉ",
    details: ["123 Đường ABC, Quận 1", "TP. Hồ Chí Minh"],
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Clock,
    title: "Giờ làm việc",
    details: ["T2 - T6: 8:00 - 18:00", "T7 - CN: 9:00 - 17:00"],
    color: "bg-orange-50 text-orange-600",
  },
];

export default function ContactPage() {
  return (
    <MainLayout>
      {/* Hero Banner */}
      <section className="relative h-72 md:h-80 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=600&fit=crop"
          alt="Contact TravelBook"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center text-white px-4">
          <nav className="text-white/60 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Liên hệ</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-white/80 mt-4 max-w-xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-12 relative z-10">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-border/50 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${info.color} mb-4`}>
                  <info.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Gửi tin nhắn</h2>
                  <p className="text-sm text-muted-foreground">Điền thông tin và chúng tôi sẽ liên hệ lại</p>
                </div>
              </div>
              <ContactForm />
            </div>

            {/* Map Placeholder */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Vị trí của chúng tôi</h2>
                  <p className="text-sm text-muted-foreground">Ghé thăm văn phòng TravelBook</p>
                </div>
              </div>
              <div className="bg-muted rounded-2xl h-[400px] flex items-center justify-center border border-border/50 relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
                  alt="Map location"
                  fill
                  className="object-cover opacity-30"
                />
                <div className="relative z-10 text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">TravelBook Office</h3>
                  <p className="text-muted-foreground text-sm">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h3>
            <p className="text-muted-foreground mb-6">
              Bạn có thể tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến tại trang FAQ.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              Xem FAQ
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
