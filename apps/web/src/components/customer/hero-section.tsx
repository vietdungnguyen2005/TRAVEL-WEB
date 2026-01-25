"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

interface HeroImage {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  active: boolean;
}

export function HeroSection() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Auto-slide mỗi 5 giây

    return () => clearInterval(interval);
  }, [heroImages.length]);

  async function fetchHeroImages() {
    try {
      const response = await fetch("/api/hero-images");
      if (response.ok) {
        const data = await response.json();
        setHeroImages(data);
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("guests", guests);

    router.push(`/rooms?${params.toString()}`);
  };

  const currentImage = heroImages[currentIndex];

  // Fallback nếu không có ảnh hoặc đang loading
  if (isLoading || heroImages.length === 0) {
    return (
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Đặt Phòng Khách Sạn Tuyệt Vời
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Trải nghiệm kỳ nghỉ hoàn hảo với giá tốt nhất
          </p>
          <SearchCard
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            guests={guests}
            setGuests={setGuests}
            handleSearch={handleSearch}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Images with Transition */}
      {heroImages.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={image.imageUrl}
            alt={image.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Navigation Arrows */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {currentImage.title}
        </h1>
        {currentImage.subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-delay">
            {currentImage.subtitle}
          </p>
        )}

        {/* CTA Button */}
        {currentImage.buttonText && currentImage.buttonLink && (
          <div className="mb-8">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Link href={currentImage.buttonLink}>
                {currentImage.buttonText}
              </Link>
            </Button>
          </div>
        )}

        {/* Search Card */}
        <SearchCard
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          guests={guests}
          setGuests={setGuests}
          handleSearch={handleSearch}
        />
      </div>
    </section>
  );
}

// Extracted Search Card Component for reusability
function SearchCard({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  handleSearch,
}: {
  checkIn: Date | undefined;
  setCheckIn: (date: Date | undefined) => void;
  checkOut: Date | undefined;
  setCheckOut: (date: Date | undefined) => void;
  guests: string;
  setGuests: (value: string) => void;
  handleSearch: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ngày nhận phòng
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? (
                  format(checkIn, "dd/MM/yyyy", { locale: vi })
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ngày trả phòng
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? (
                  format(checkOut, "dd/MM/yyyy", { locale: vi })
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || (checkIn ? date <= checkIn : false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Số khách
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="w-full">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 khách</SelectItem>
              <SelectItem value="2">2 khách</SelectItem>
              <SelectItem value="3">3 khách</SelectItem>
              <SelectItem value="4">4 khách</SelectItem>
              <SelectItem value="5">5 khách</SelectItem>
              <SelectItem value="6">6+ khách</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className="w-full h-10"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Tìm phòng
          </Button>
        </div>
      </div>
    </div>
  );
}
