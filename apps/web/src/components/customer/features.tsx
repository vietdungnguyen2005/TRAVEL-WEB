"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, CreditCard, Clock, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Đảm bảo giá tốt nhất",
    description: "Cam kết hoàn tiền chênh lệch nếu bạn tìm được giá thấp hơn ở nơi khác",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    description: "Hỗ trợ Visa, Mastercard, MoMo, VNPay và nhiều phương thức khác",
  },
  {
    icon: Clock,
    title: "Đặt phòng nhanh chóng",
    description: "Chỉ 3 bước đơn giản để hoàn tất đặt phòng trong vài phút",
  },
  {
    icon: HeadphonesIcon,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng giải đáp mọi thắc mắc",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn <span className="text-primary">Travel</span><span className="text-gold">Book</span>?
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hàng triệu khách hàng tin tưởng lựa chọn TravelBook cho mỗi chuyến đi
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                bg-white rounded-2xl p-8 shadow-sm border border-border/50
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                ${isVisible ? "animate-slide-up" : "opacity-0"}
              `}
              style={{ animationDelay: isVisible ? `${index * 150}ms` : undefined }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
