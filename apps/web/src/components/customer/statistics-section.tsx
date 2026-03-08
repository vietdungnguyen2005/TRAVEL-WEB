"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Building2, Users, CalendarCheck, Star } from "lucide-react";

const stats = [
  {
    icon: CalendarCheck,
    value: 100000,
    suffix: "+",
    label: "Lượt đặt phòng",
    isDecimal: false,
  },
  {
    icon: Building2,
    value: 500,
    suffix: "+",
    label: "Khách sạn đối tác",
    isDecimal: false,
  },
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Khách hàng hài lòng",
    isDecimal: false,
  },
  {
    icon: Star,
    value: 4.8,
    suffix: "/5",
    label: "Đánh giá trung bình",
    isDecimal: true,
  },
];

function useCountUp(target: number, duration: number, shouldStart: boolean, isDecimal: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = performance.now();
    let animationId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [shouldStart, target, duration, isDecimal]);

  return count;
}

function StatItem({ stat, isVisible, index }: {
  stat: typeof stats[0];
  isVisible: boolean;
  index: number;
}) {
  const count = useCountUp(stat.value, 2000 + index * 200, isVisible, stat.isDecimal);

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
          <stat.icon className="h-7 w-7 text-gold" />
        </div>
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {stat.isDecimal ? count.toFixed(1) : count.toLocaleString("vi-VN")}
        <span className="text-gold">{stat.suffix}</span>
      </div>
      <p className="text-white/70 text-sm font-medium">{stat.label}</p>
    </div>
  );
}

export function StatisticsSection() {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 bg-primary overflow-hidden"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Con số ấn tượng
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              stat={stat}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
