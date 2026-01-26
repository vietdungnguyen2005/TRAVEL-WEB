import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { ImageGallery } from "@/components/customer/image-gallery";
import { BookingFormClient } from "@/components/customer/booking-form-client";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Bed, Maximize, Wifi, Tv, Wind, Coffee, CheckCircle } from "lucide-react";
const amenityIcons = {
    "Wifi": Wifi,
    "TV": Tv,
    "AC": Wind,
    "Air Conditioning": Wind,
    "Mini Bar": Coffee,
    "Coffee Maker": Coffee,
};
async function getRoomType(id) {
    try {
        const roomType = await prisma.roomType.findUnique({
            where: { id },
            include: {
                rooms: {
                    where: { status: "AVAILABLE" },
                },
            },
        });
        return roomType;
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Prisma error fetching room type:', err);
        return null;
    }
}
export default async function RoomDetailPage({ params }) {
    const { id } = await params;
    const roomType = await getRoomType(id);
    if (!roomType) {
        notFound();
    }
    const availableRoomsCount = roomType.rooms.length;
    return (_jsx(MainLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx(ImageGallery, { images: roomType.images, roomName: roomType.name }), _jsx("div", { children: _jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: roomType.name }), _jsxs("div", { className: "flex items-center gap-4 text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "h-4 w-4" }), _jsxs("span", { children: ["Up to ", roomType.capacity, " guests"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Bed, { className: "h-4 w-4" }), _jsxs("span", { children: [roomType.bedCount, " ", roomType.bedCount === 1 ? "bed" : "beds"] })] }), roomType.size && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Maximize, { className: "h-4 w-4" }), _jsxs("span", { children: [roomType.size, "sqm"] })] }))] })] }), roomType.featured && (_jsx(Badge, { className: "bg-yellow-500 hover:bg-yellow-600", children: "Featured" }))] }) }), availableRoomsCount > 0 && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800", children: [_jsx(CheckCircle, { className: "inline h-4 w-4 mr-2" }), availableRoomsCount, " ", availableRoomsCount === 1 ? "room" : "rooms", " available"] })), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "About This Room" }), _jsx("p", { className: "text-gray-700 leading-relaxed whitespace-pre-line", children: roomType.description })] }), _jsx(Separator, {}), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Amenities" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: roomType.amenities?.map((amenity) => {
                                                const Icon = amenityIcons[amenity] || CheckCircle;
                                                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { className: "h-5 w-5 text-primary" }), _jsx("span", { children: amenity })] }, amenity));
                                            }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Room Policies" }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Check-in" }), _jsx("span", { className: "font-medium", children: "After 2:00 PM" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Check-out" }), _jsx("span", { className: "font-medium", children: "Before 12:00 PM" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Cancellation" }), _jsx("span", { className: "font-medium", children: "Free cancellation up to 24 hours before check-in" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Smoking" }), _jsx("span", { className: "font-medium", children: "Non-smoking room" })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Guest Reviews" }), _jsx(ReviewsList, { roomTypeId: roomType.id })] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsx(BookingFormClient, { roomTypeId: roomType.id, basePrice: Number(roomType.pricePerNight), capacity: roomType.capacity }) })] }) }) }));
}
//# sourceMappingURL=page.js.map