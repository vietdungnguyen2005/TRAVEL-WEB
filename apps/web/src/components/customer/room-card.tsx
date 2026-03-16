"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bed, Maximize, Star, Heart, MapPin } from "lucide-react";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    bedCount: number;
    size: number | null;
    images: string[];
    featured?: boolean;
    location?: string;
    rating?: number;
    reviewCount?: number;
    /** Number of rooms available for the selected dates (sent when checkIn/checkOut provided) */
    availableCount?: number;
    /** Total price for the entire stay (basePrice × nights, when dates provided) */
    totalPrice?: number;
    /** Number of nights (derived from checkIn/checkOut) */
    nights?: number;
  };
  variant?: "grid" | "list";
}

export function RoomCard({ room, variant = "grid" }: RoomCardProps) {
  const images = Array.isArray(room.images) ? room.images : [];
  const sizeText = typeof room.size === "number" ? `${room.size}m²` : "-";
  const capacityText = typeof room.capacity === "number" ? `${room.capacity} khách` : "-";
  const bedCountText = typeof room.bedCount === "number" ? `${room.bedCount} giường` : "-";
  const rating = room.rating ?? 4.5;
  // Derive a stable "random" review count from room id to avoid hydration mismatch
  const reviewCount = room.reviewCount ?? (room.id.charCodeAt(0) % 80 + 20);
  const originalPrice = Math.round(Number(room.pricePerNight) * 1.15);

  if (variant === "list") {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-48 w-full md:h-48 md:w-64 shrink-0 overflow-hidden">
            <Image
              src={images[0] || "/placeholder-room.svg"}
              alt={room.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 256px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith("/placeholder-room.svg")) {
                  target.src = "/placeholder-room.svg";
                }
              }}
            />
            {room.featured && (
              <Badge className="absolute left-3 top-3 bg-gold text-gold-foreground hover:bg-gold/90">
                Nổi bật
              </Badge>
            )}
          </div>

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug truncate">{room.name}</h3>
                {room.location && (
                  <div className="flex items-center gap-1 mt-0.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{room.location}</span>
                  </div>
                )}
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {room.description}
                </p>
              </div>
              {/* Rating */}
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span className="text-sm font-semibold">{rating}</span>
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{capacityText}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{bedCountText}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{sizeText}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-60 p-5 border-t md:border-t-0 md:border-l flex md:flex-col items-start md:items-end justify-between md:justify-start gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground line-through">
                {originalPrice.toLocaleString("vi-VN")} VND
              </div>
              <div className="text-xl font-bold text-primary">
                {Number(room.pricePerNight).toLocaleString("vi-VN")} VND
              </div>
              <div className="text-xs text-muted-foreground">/ đêm</div>
              {typeof room.totalPrice === "number" && typeof room.nights === "number" && room.nights > 0 && (
                <div className="mt-1 text-sm font-semibold text-foreground">
                  Tổng {room.nights} đêm: {room.totalPrice.toLocaleString("vi-VN")} VND
                </div>
              )}
            </div>

            {typeof room.availableCount === "number" && (
              <Badge variant="secondary" className={
                room.availableCount <= 2
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }>
                {room.availableCount <= 2
                  ? `Chỉ còn ${room.availableCount} phòng!`
                  : `${room.availableCount} phòng trống`}
              </Badge>
            )}

            <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90">
              <Link href={`/rooms/${room.id}`}>Xem tình trạng</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={images[0] || "/placeholder-room.svg"}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.endsWith("/placeholder-room.svg")) {
              target.src = "/placeholder-room.svg";
            }
          }}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        {room.featured && (
          <Badge className="absolute top-4 left-4 bg-gold text-gold-foreground hover:bg-gold/90">
            Nổi bật
          </Badge>
        )}
        <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold leading-snug">{room.name}</h3>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="text-sm font-semibold">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        {room.location && (
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{room.location}</span>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{capacityText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{bedCountText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" />
            <span>{sizeText}</span>
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString("vi-VN")} VND
            </p>
            <p className="text-2xl font-bold text-primary">
              {Number(room.pricePerNight).toLocaleString("vi-VN")} <span className="text-base font-normal">VND</span>
            </p>
            <p className="text-xs text-muted-foreground">/ đêm</p>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Giảm 15%
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/rooms/${room.id}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 font-semibold">
            Xem chi tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
