"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    location: "Hà Nội",
    avatar: "MA",
    rating: 5,
    text: "Dịch vụ tuyệt vời! Đặt phòng nhanh chóng, giá tốt hơn nhiều so với các trang khác. Phòng sạch sẽ, nhân viên thân thiện. Chắc chắn sẽ quay lại.",
  },
  {
    name: "Trần Hoàng Nam",
    location: "TP. Hồ Chí Minh",
    avatar: "HN",
    rating: 5,
    text: "Lần đầu sử dụng TravelBook và rất hài lòng. Giao diện dễ dùng, có nhiều lựa chọn phòng. Đặc biệt chương trình giảm giá rất hấp dẫn!",
  },
  {
    name: "Phạm Thị Hương",
    location: "Đà Nẵng",
    avatar: "TH",
    rating: 5,
    text: "Mình đã đặt phòng cho cả gia đình đi Nha Trang qua TravelBook. Mọi thứ rất thuận lợi, check-in nhanh gọn. Giá phòng rẻ hơn đặt trực tiếp!",
  },
  {
    name: "Lê Văn Đức",
    location: "Nha Trang",
    avatar: "VĐ",
    rating: 4,
    text: "Hỗ trợ khách hàng rất nhiệt tình. Mình gặp vấn đề khi thanh toán và được giải quyết ngay lập tức. Rất đáng tin cậy.",
  },
  {
    name: "Vũ Thị Mai Linh",
    location: "Hội An",
    avatar: "ML",
    rating: 5,
    text: "Website rất đẹp và dễ sử dụng. Mình thích tính năng so sánh giá và xem đánh giá từ khách hàng khác. Rất hữu ích cho việc chọn phòng.",
  },
  {
    name: "Đỗ Quang Hải",
    location: "Đà Lạt",
    avatar: "QH",
    rating: 5,
    text: "Đã đặt phòng 5 lần qua TravelBook, lần nào cũng hài lòng. Giá luôn tốt nhất, nhiều ưu đãi cho khách quen. Tuyệt vời!",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Detect cardsPerView on client only, after mount
  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(window.innerWidth >= 1024 ? 3 : 1);
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  return (
    <section ref={sectionRef} className="py-20 bg-muted/50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Khách hàng nói gì về <span className="text-primary">Travel</span><span className="text-gold">Book</span>?
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hàng nghìn đánh giá tích cực từ khách hàng trên toàn quốc
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden mx-6">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="shrink-0 px-3 w-full lg:w-1/3"
                >
                  <div className={cn(
                    "bg-white rounded-2xl p-8 shadow-sm border border-border/50 h-full",
                    isVisible ? "animate-slide-up" : "opacity-0"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Quote icon */}
                    <Quote className="h-8 w-8 text-gold/30 mb-4" />

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < testimonial.rating
                              ? "text-gold fill-gold"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-foreground/80 leading-relaxed mb-6 text-sm">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-gold w-8"
                    : "bg-muted-foreground/20 hover:bg-muted-foreground/40 w-2"
                )}
                aria-label={`Go to testimonial group ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
