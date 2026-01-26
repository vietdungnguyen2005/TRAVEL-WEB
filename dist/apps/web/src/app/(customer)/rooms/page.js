import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense } from "react";
import { findRoomTypes } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { RoomCard } from "@/components/customer/room-card";
import { RoomFiltersClient } from "@/components/customer/room-filters-client";
import { Skeleton } from "@/components/ui/skeleton";
async function getRooms(searchParams) {
    const params = await searchParams;
    const { minPrice, maxPrice, capacity, roomTypes, sortBy = "price-asc", } = params;
    const where = {
        available: true,
    };
    if (minPrice || maxPrice) {
        where.pricePerNight = {};
        if (minPrice)
            where.pricePerNight.gte = parseFloat(minPrice);
        if (maxPrice)
            where.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (capacity && capacity !== "all") {
        const capacityNum = parseInt(capacity);
        where.capacity = capacityNum >= 4 ? { gte: 4 } : capacityNum;
    }
    if (roomTypes) {
        const types = roomTypes.split(",");
        where.name = {
            in: types,
        };
    }
    let orderBy = {};
    switch (sortBy) {
        case "price-asc":
            orderBy = { pricePerNight: "asc" };
            break;
        case "price-desc":
            orderBy = { pricePerNight: "desc" };
            break;
        case "capacity":
            orderBy = { capacity: "desc" };
            break;
        case "name":
            orderBy = { name: "asc" };
            break;
    }
    let rooms = [];
    try {
        rooms = await findRoomTypes({ where, orderBy });
    }
    catch (err) {
        // If DB is down in dev, return empty list and log
        // eslint-disable-next-line no-console
        console.error('Prisma error fetching rooms:', err);
        rooms = [];
    }
    return rooms;
}
function RoomListSkeleton() {
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-64 w-full" }), _jsx(Skeleton, { className: "h-8 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-2/3" })] }, i))) }));
}
async function RoomList({ searchParams }) {
    const rooms = await getRooms(searchParams);
    const params = await searchParams;
    const { checkIn, checkOut, guests } = params;
    return (_jsxs(_Fragment, { children: [(checkIn || checkOut || guests) && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("p", { className: "text-sm text-blue-900", children: [_jsx("span", { className: "font-semibold", children: "Your search:" }), checkIn && (_jsxs("span", { className: "ml-2", children: ["Check-in: ", _jsx("strong", { children: new Date(checkIn).toLocaleDateString("vi-VN") })] })), checkOut && (_jsxs("span", { className: "ml-2", children: ["Check-out: ", _jsx("strong", { children: new Date(checkOut).toLocaleDateString("vi-VN") })] })), guests && (_jsxs("span", { className: "ml-2", children: ["Guests: ", _jsxs("strong", { children: [guests, " people"] })] }))] }) })), _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: rooms.length > 0 ? (_jsxs(_Fragment, { children: ["Found ", _jsx("span", { className: "text-primary", children: rooms.length }), " rooms"] })) : ("No rooms found") }), _jsx("p", { className: "text-gray-600 mt-1", children: "Select a room that suits your needs" })] }), rooms.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: rooms.map((room) => (_jsx(RoomCard, { room: {
                        ...room,
                        pricePerNight: Number(room.pricePerNight)
                    } }, room.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-lg text-gray-600", children: "No rooms match your search criteria." }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Try adjusting your filters or search with different criteria." })] }))] }));
}
export default async function RoomsPage({ searchParams }) {
    const params = await searchParams;
    return (_jsx(MainLayout, { children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsx("aside", { className: "lg:col-span-1", children: _jsxs("div", { className: "sticky top-20", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Filters" }), _jsx(RoomFiltersClient, { initialParams: params })] }) }), _jsx("main", { className: "lg:col-span-3", children: _jsx(Suspense, { fallback: _jsx(RoomListSkeleton, {}), children: _jsx(RoomList, { searchParams: searchParams }) }) })] }) }) }));
}
//# sourceMappingURL=page.js.map