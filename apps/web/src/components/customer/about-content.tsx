"use client";

import { useEffect, useRef, useState } from "react";
import { Hotel, Users, Heart, Shield, Globe, Award, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const coreValues = [
  {
    icon: Hotel,
    title: "Đa dạng lựa chọn",
    description: "Hàng trăm phòng với nhiều loại hình và mức giá phù hợp với mọi nhu cầu du lịch và công tác.",
  },
  {
    icon: Users,
    title: "Dịch vụ tận tâm",
    description: "Đội ngũ nhân viên chuyên nghiệp, nhiệt tình hỗ trợ 24/7 bằng tiếng Việt và tiếng Anh.",
  },
  {
    icon: Heart,
    title: "Trải nghiệm tuyệt vời",
    description: "Cam kết mang đến trải nghiệm lưu trú đáng nhớ và thoải mái nhất cho mọi khách hàng.",
  },
  {
    icon: Shield,
    title: "An toàn & Bảo mật",
    description: "Thanh toán an toàn với hệ thống mã hóa SSL và tuân thủ chuẩn bảo mật quốc tế PCI DSS.",
  },
];

const milestones = [
  { year: "2020", title: "Thành lập", description: "TravelBook ra đời với sứ mệnh kết nối du khách với những trải nghiệm lưu trú tuyệt vời." },
  { year: "2021", title: "100 khách sạn đối tác", description: "Đạt mốc 100 khách sạn và resort đối tác trên toàn quốc." },
  { year: "2023", title: "50,000 khách hàng", description: "Phục vụ hơn 50,000 khách hàng với tỷ lệ hài lòng 98%." },
  { year: "2025", title: "Mở rộng toàn quốc", description: "Có mặt tại 63 tỉnh thành với hơn 500 đối tác khách sạn và resort." },
];

export function AboutContent() {
  const valuesRef = useRef<HTMLDivElement>(null);
  const [valuesVisible, setValuesVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineVisible, setTimelineVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === valuesRef.current) setValuesVisible(true);
            if (entry.target === timelineRef.current) setTimelineVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (valuesRef.current) observer.observe(valuesRef.current);
    if (timelineRef.current) observer.observe(timelineRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&h=600&fit=crop"
          alt="About TravelBook"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center text-white px-4">
          <nav className="text-white/60 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Về chúng tôi</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg">Về chúng tôi</h1>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                Câu chuyện của chúng tôi
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nền tảng đặt phòng <span className="text-gold">hàng đầu</span> Việt Nam
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                TravelBook ra đời năm 2020 với mong muốn mang đến trải nghiệm đặt phòng khách sạn
                đơn giản, nhanh chóng và đáng tin cậy cho mọi du khách Việt Nam.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Với hệ thống đặt phòng hiện đại, thanh toán an toàn và dịch vụ chăm sóc
                khách hàng 24/7, chúng tôi đã phục vụ hơn 100,000 lượt đặt phòng và nhận được
                đánh giá trung bình 4.8/5 từ khách hàng.
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Khách sạn đối tác</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100K+</div>
                  <div className="text-sm text-muted-foreground">Lượt đặt phòng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Đánh giá TB</div>
                </div>
              </div>
            </div>

            <div className="relative h-80 md:h-[480px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
                alt="Hotel interior"
                fill
                className="object-cover"
              />
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-gold rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-gold rounded-br-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Giá trị <span className="text-gold">cốt lõi</span>
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto rounded-full mb-4" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những giá trị mà chúng tôi cam kết mang đến cho mọi khách hàng
            </p>
          </div>

          <div ref={valuesRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`
                  bg-white rounded-2xl p-8 shadow-sm border border-border/50
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                  ${valuesVisible ? "animate-slide-up" : "opacity-0"}
                `}
                style={{ animationDelay: valuesVisible ? `${index * 150}ms` : undefined }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hành trình <span className="text-gold">phát triển</span>
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
          </div>

          <div ref={timelineRef} className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`
                  relative flex gap-6 pb-12 last:pb-0
                  ${timelineVisible ? "animate-slide-up" : "opacity-0"}
                `}
                style={{ animationDelay: timelineVisible ? `${index * 200}ms` : undefined }}
              >
                {index < milestones.length - 1 && (
                  <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-border/50">
                  <div className="text-gold font-bold text-lg mb-1">{milestone.year}</div>
                  <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tầm nhìn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chúng tôi hướng tới mục tiêu trở thành nền tảng đặt phòng được tin tưởng nhất
                Đông Nam Á, nơi mọi người có thể dễ dàng tìm kiếm và đặt phòng cho kỳ nghỉ
                hoàn hảo của mình.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-gold/15 flex items-center justify-center mb-5">
                <Award className="h-7 w-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sứ mệnh</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kết nối khách hàng với những trải nghiệm lưu trú tuyệt vời, đồng thời
                hỗ trợ các khách sạn phát triển kinh doanh bền vững thông qua công nghệ
                và dịch vụ chuyên nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
