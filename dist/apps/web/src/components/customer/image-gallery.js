"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ImageGallery({ images, roomName }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    if (!images || images.length === 0) {
        return (_jsx("div", { className: "relative h-96 bg-gray-200 rounded-lg flex items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "No images available" }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative h-96 md:h-[500px] rounded-lg overflow-hidden group", children: [_jsx(Image, { src: images[currentIndex], alt: `${roomName} - Image ${currentIndex + 1}`, fill: true, className: "object-cover", priority: true, sizes: "(max-width: 768px) 100vw, 80vw" }), images.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", size: "icon", className: "absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity", onClick: goToPrevious, children: _jsx(ChevronLeft, { className: "h-6 w-6" }) }), _jsx(Button, { variant: "secondary", size: "icon", className: "absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity", onClick: goToNext, children: _jsx(ChevronRight, { className: "h-6 w-6" }) })] })), _jsxs("div", { className: "absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm", children: [currentIndex + 1, " / ", images.length] })] }), images.length > 1 && (_jsx("div", { className: "grid grid-cols-4 md:grid-cols-6 gap-2", children: images.map((image, index) => (_jsx("button", { onClick: () => setCurrentIndex(index), className: `relative h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                        ? "border-primary scale-105"
                        : "border-transparent hover:border-gray-300"}`, children: _jsx(Image, { src: image, alt: `Thumbnail ${index + 1}`, fill: true, className: "object-cover", sizes: "(max-width: 768px) 25vw, 15vw" }) }, index))) }))] }));
}
//# sourceMappingURL=image-gallery.js.map