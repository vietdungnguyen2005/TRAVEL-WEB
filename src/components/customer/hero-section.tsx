"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Users, Search } from "lucide-react";
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

export function HeroSection() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("guests", guests);

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="container relative z-10 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Đặt Phòng Khách Sạn Tuyệt Vời
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          Trải nghiệm kỳ nghỉ hoàn hảo với giá tốt nhất
        </p>

        {/* Search Card */}
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
      </div>
    </section>
  );
}
