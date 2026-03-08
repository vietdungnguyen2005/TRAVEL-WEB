"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  slug?: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedCount: number;
  size: number | null;
  images: string[];
  featured: boolean;
}

interface FeaturedRoomsProps {
  rooms: Room[];
}

const destinations = [
  {
    name: "Hà Nội",
    count: "150+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1200&h=800&fit=crop",
  },
  {
    name: "TP. Hồ Chí Minh",
    count: "200+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=800&fit=crop",
  },
  {
    name: "Đà Nẵng",
    count: "120+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=800&fit=crop",
  },
  {
    name: "Nha Trang",
    count: "90+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
  },
  {
    name: "Hội An",
    count: "80+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=800&fit=crop",
  },
  {
    name: "Đà Lạt",
    count: "100+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
  },
  {
    name: "Phú Quốc",
    count: "70+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&h=800&fit=crop",
  },
  {
    name: "Hạ Long",
    count: "60+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&h=800&fit=crop",
  },
  {
    name: "Huế",
    count: "55+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop",
  },
  {
    name: "Sa Pa",
    count: "45+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop",
  },
  {
    name: "Quy Nhơn",
    count: "35+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop",
  },
  {
    name: "Vũng Tàu",
    count: "50+ khách sạn",
    imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&h=800&fit=crop",
  },
];

export function FeaturedRooms({ rooms }: FeaturedRoomsProps) {
  void rooms;

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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Điểm đến <span className="text-gold">phổ biến</span>
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá những điểm đến hấp dẫn nhất Việt Nam với ưu đãi khách sạn tốt nhất
          </p>
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d, index) => {
            const isFeatured = index < 2;
            return (
              <Link
                key={d.name}
                href={`/rooms?location=${encodeURIComponent(d.name)}`}
                className={cn(
                  "group block",
                  isFeatured && "lg:col-span-1 lg:first:col-span-2 lg:[&:nth-child(2)]:col-span-1",
                  isVisible ? "animate-slide-up" : "opacity-0"
                )}
                style={{ animationDelay: isVisible ? `${index * 80}ms` : undefined }}
              >
                <div className={cn(
                  "relative overflow-hidden rounded-2xl",
                  isFeatured ? "h-56 md:h-72" : "h-48 md:h-56"
                )}>
                  <Image
                    src={d.imageUrl}
                    alt={d.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/60" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {d.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{d.count}</span>
                    </div>
                  </div>

                  {/* Gold accent bar on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
