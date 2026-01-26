"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { CalendarIcon, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { gatewayFetch } from "@/lib/gateway-client";
export function HeroSection() {
    const router = useRouter();
    const [checkIn, setCheckIn] = useState();
    const [checkOut, setCheckOut] = useState();
    const [guests, setGuests] = useState("2");
    const [heroImages, setHeroImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchHeroImages();
    }, []);
    useEffect(() => {
        if (heroImages.length <= 1)
            return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Auto-slide mỗi 5 giây
        return () => clearInterval(interval);
    }, [heroImages.length]);
    async function fetchHeroImages() {
        try {
            const response = await gatewayFetch("/api/hero-images", { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setHeroImages(data);
            }
        }
        catch (error) {
            console.error("Error fetching hero images:", error);
        }
        finally {
            setIsLoading(false);
        }
    }
    const handlePrevious = () => {
        setCurrentIndex((prev) => prev === 0 ? heroImages.length - 1 : prev - 1);
    };
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    };
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (checkIn)
            params.set("checkIn", checkIn.toISOString());
        if (checkOut)
            params.set("checkOut", checkOut.toISOString());
        params.set("guests", guests);
        router.push(`/rooms?${params.toString()}`);
    };
    const currentImage = heroImages[currentIndex];
    // Fallback nếu không có ảnh hoặc đang loading
    if (isLoading || heroImages.length === 0) {
        return (_jsxs("section", { className: "relative h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800", children: [_jsx("div", { className: "absolute inset-0 bg-black/20" }), _jsxs("div", { className: "container relative z-10 text-center text-white", children: [_jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-4", children: "\u0110\u1EB7t Ph\u00F2ng Kh\u00E1ch S\u1EA1n Tuy\u1EC7t V\u1EDDi" }), _jsx("p", { className: "text-xl md:text-2xl mb-8 text-blue-100", children: "Tr\u1EA3i nghi\u1EC7m k\u1EF3 ngh\u1EC9 ho\u00E0n h\u1EA3o v\u1EDBi gi\u00E1 t\u1ED1t nh\u1EA5t" }), _jsx(SearchCard, { checkIn: checkIn, setCheckIn: setCheckIn, checkOut: checkOut, setCheckOut: setCheckOut, guests: guests, setGuests: setGuests, handleSearch: handleSearch })] })] }));
    }
    return (_jsxs("section", { className: "relative h-[600px] flex items-center justify-center overflow-hidden", children: [heroImages.map((image, index) => (_jsxs("div", { className: cn("absolute inset-0 transition-opacity duration-1000", index === currentIndex ? "opacity-100" : "opacity-0"), children: [_jsx(Image, { src: image.imageUrl, alt: image.title, fill: true, className: "object-cover", priority: index === 0, sizes: "100vw" }), _jsx("div", { className: "absolute inset-0 bg-black/40" })] }, image.id))), heroImages.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handlePrevious, className: "absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all", "aria-label": "Previous slide", children: _jsx(ChevronLeft, { className: "h-6 w-6" }) }), _jsx("button", { onClick: handleNext, className: "absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all", "aria-label": "Next slide", children: _jsx(ChevronRight, { className: "h-6 w-6" }) })] })), heroImages.length > 1 && (_jsx("div", { className: "absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2", children: heroImages.map((_, index) => (_jsx("button", { onClick: () => setCurrentIndex(index), className: cn("w-2 h-2 rounded-full transition-all", index === currentIndex
                        ? "bg-white w-8"
                        : "bg-white/50 hover:bg-white/75"), "aria-label": `Go to slide ${index + 1}` }, index))) })), _jsxs("div", { className: "container relative z-10 text-center text-white", children: [_jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-4 animate-fade-in", children: currentImage.title }), currentImage.subtitle && (_jsx("p", { className: "text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-delay", children: currentImage.subtitle })), currentImage.buttonText && currentImage.buttonLink && (_jsx("div", { className: "mb-8", children: _jsx(Button, { asChild: true, size: "lg", className: "bg-white text-blue-600 hover:bg-blue-50", children: _jsx(Link, { href: currentImage.buttonLink, children: currentImage.buttonText }) }) })), _jsx(SearchCard, { checkIn: checkIn, setCheckIn: setCheckIn, checkOut: checkOut, setCheckOut: setCheckOut, guests: guests, setGuests: setGuests, handleSearch: handleSearch })] })] }));
}
// Extracted Search Card Component for reusability
function SearchCard({ checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests, handleSearch, }) {
    return (_jsx("div", { className: "max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Ng\u00E0y nh\u1EADn ph\u00F2ng" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), checkIn ? (format(checkIn, "dd/MM/yyyy", { locale: vi })) : (_jsx("span", { children: "Ch\u1ECDn ng\u00E0y" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: checkIn, onSelect: setCheckIn, disabled: (date) => date < new Date(), initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Ng\u00E0y tr\u1EA3 ph\u00F2ng" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), checkOut ? (format(checkOut, "dd/MM/yyyy", { locale: vi })) : (_jsx("span", { children: "Ch\u1ECDn ng\u00E0y" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: checkOut, onSelect: setCheckOut, disabled: (date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date < today || (checkIn ? date <= checkIn : false);
                                        }, initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "S\u1ED1 kh\u00E1ch" }), _jsxs(Select, { value: guests, onValueChange: setGuests, children: [_jsxs(SelectTrigger, { className: "w-full", children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), _jsx(SelectValue, {})] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "1 kh\u00E1ch" }), _jsx(SelectItem, { value: "2", children: "2 kh\u00E1ch" }), _jsx(SelectItem, { value: "3", children: "3 kh\u00E1ch" }), _jsx(SelectItem, { value: "4", children: "4 kh\u00E1ch" }), _jsx(SelectItem, { value: "5", children: "5 kh\u00E1ch" }), _jsx(SelectItem, { value: "6", children: "6+ kh\u00E1ch" })] })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { onClick: handleSearch, className: "w-full h-10", size: "lg", children: [_jsx(Search, { className: "mr-2 h-4 w-4" }), "T\u00ECm ph\u00F2ng"] }) })] }) }));
}
//# sourceMappingURL=hero-section.js.map