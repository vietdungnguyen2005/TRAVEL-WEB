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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Users, Search, ChevronLeft, ChevronRight, MapPin, Star, Building2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { gatewayFetch } from "@/lib/gateway-client";

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
  const [location, setLocation] = useState<string>("");
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [slideKey, setSlideKey] = useState(0);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    const safeHeroImages = Array.isArray(heroImages) ? heroImages : [];
    if (safeHeroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeHeroImages.length);
      setSlideKey((prev) => prev + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages]);

  async function fetchHeroImages() {
    try {
      const response = await gatewayFetch("/api/hero-images", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        const images = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const activeImages = images
          .filter((img: HeroImage) => img?.active !== false)
          .sort((a: HeroImage, b: HeroImage) => (a.order || 0) - (b.order || 0));
        setHeroImages(activeImages);
      } else {
        setHeroImages([]);
      }
    } catch {
      setHeroImages([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrevious = () => {
    const safeHeroImages = Array.isArray(heroImages) ? heroImages : [];
    setCurrentIndex((prev) =>
      prev === 0 ? safeHeroImages.length - 1 : prev - 1
    );
    setSlideKey((prev) => prev + 1);
  };

  const handleNext = () => {
    const safeHeroImages = Array.isArray(heroImages) ? heroImages : [];
    setCurrentIndex((prev) => (prev + 1) % safeHeroImages.length);
    setSlideKey((prev) => prev + 1);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("guests", guests);
    if (location) params.set("location", location);
    router.push(`/rooms?${params.toString()}`);
  };

  const safeHeroImages = Array.isArray(heroImages) ? heroImages : [];
  const currentImage = safeHeroImages[currentIndex];

  if (isLoading || safeHeroImages.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-ocean to-primary">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        <div className="container relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8">
            <MapPin className="h-4 w-4 text-gold" />
            <span className="text-white/90">Khám phá Việt Nam cùng TravelBook</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg leading-tight">
            Đặt Phòng Khách Sạn
            <br />
            <span className="text-gold">Tuyệt Vời</span>
          </h1>
          <p className="text-lg md:text-2xl mb-12 text-white/80 max-w-2xl mx-auto">
            Trải nghiệm kỳ nghỉ hoàn hảo với giá tốt nhất tại hơn 500 khách sạn trên toàn quốc
          </p>
          <SearchCard
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            guests={guests}
            setGuests={setGuests}
            location={location}
            setLocation={setLocation}
            handleSearch={handleSearch}
          />
          <TrustBar />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Ken Burns */}
      {safeHeroImages.map((image, index) => (
        <div
          key={`${image.id}-${index === currentIndex ? slideKey : 'idle'}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={image.imageUrl}
            alt={image.title}
            fill
            className={cn(
              "object-cover",
              index === currentIndex && "animate-ken-burns"
            )}
            priority={index === 0}
            sizes="100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-hero.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>
      ))}

      {/* Navigation Arrows */}
      {safeHeroImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 text-white p-4 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 text-white p-4 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {safeHeroImages.length > 1 && (
        <div className="absolute bottom-36 md:bottom-40 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {safeHeroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setSlideKey((prev) => prev + 1);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === currentIndex
                  ? "bg-gold w-10"
                  : "bg-white/40 hover:bg-white/60 w-2"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 text-center text-white px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8 animate-fade-in">
          <MapPin className="h-4 w-4 text-gold" />
          <span className="text-white/90">Khám phá Việt Nam cùng TravelBook</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg animate-fade-in leading-tight">
          {currentImage.title}
        </h1>
        {currentImage.subtitle && (
          <p className="text-lg md:text-2xl mb-8 text-white/80 animate-fade-in-delay max-w-2xl mx-auto">
            {currentImage.subtitle}
          </p>
        )}

        {currentImage.buttonText && currentImage.buttonLink && (
          <div className="mb-10 animate-fade-in-delay">
            <Button
              asChild
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg text-base px-8 py-6"
            >
              <Link href={currentImage.buttonLink}>
                {currentImage.buttonText}
              </Link>
            </Button>
          </div>
        )}

        <SearchCard
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          guests={guests}
          setGuests={setGuests}
          location={location}
          setLocation={setLocation}
          handleSearch={handleSearch}
        />

        <TrustBar />
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 text-white/60 text-sm">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-gold" />
        <span><strong className="text-white">500+</strong> khách sạn</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gold" />
        <span><strong className="text-white">100K+</strong> lượt đặt phòng</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-gold" />
        <span><strong className="text-white">4.8/5</strong> đánh giá</span>
      </div>
    </div>
  );
}

function SearchCard({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  location,
  setLocation,
  handleSearch,
}: {
  checkIn: Date | undefined;
  setCheckIn: (date: Date | undefined) => void;
  checkOut: Date | undefined;
  setCheckOut: (date: Date | undefined) => void;
  guests: string;
  setGuests: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  handleSearch: () => void;
}) {
  const locationOptions = [
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Hội An", "Đà Lạt",
    "Phú Quốc", "Hạ Long", "Huế", "Sa Pa", "Quy Nhơn", "Vũng Tàu",
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Địa điểm
          </label>
          <Select value={location || "all"} onValueChange={(v) => setLocation(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-white/40 text-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả địa điểm</SelectItem>
              {locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Ngày nhận phòng
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/90 backdrop-blur-sm border-white/40 hover:bg-white text-foreground",
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
          <label className="text-sm font-medium text-white/80">
            Ngày trả phòng
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/90 backdrop-blur-sm border-white/40 hover:bg-white text-foreground",
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
          <label className="text-sm font-medium text-white/80">
            Số khách
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-white/40 text-foreground">
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
            className="w-full h-10 bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg font-semibold"
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
