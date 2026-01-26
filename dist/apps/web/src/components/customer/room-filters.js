"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function RoomFilters({ onFilterChange, initialFilters }) {
    const [filters, setFilters] = useState(initialFilters || {
        priceRange: [0, 10000000],
        capacity: null,
        roomTypes: [],
        sortBy: "price-asc",
    });
    const handlePriceChange = (value) => {
        const newFilters = { ...filters, priceRange: [value[0], value[1]] };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleCapacityChange = (value) => {
        const newFilters = { ...filters, capacity: value === "all" ? null : parseInt(value) };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleRoomTypeChange = (roomType, checked) => {
        const newRoomTypes = checked
            ? [...filters.roomTypes, roomType]
            : filters.roomTypes.filter((t) => t !== roomType);
        const newFilters = { ...filters, roomTypes: newRoomTypes };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleSortChange = (value) => {
        const newFilters = { ...filters, sortBy: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    const handleReset = () => {
        const defaultFilters = {
            priceRange: [0, 10000000],
            capacity: null,
            roomTypes: [],
            sortBy: "price-asc",
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Sort By" }) }), _jsx(CardContent, { children: _jsxs(Select, { value: filters.sortBy, onValueChange: handleSortChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select sorting" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "price-asc", children: "Price: Low to High" }), _jsx(SelectItem, { value: "price-desc", children: "Price: High to Low" }), _jsx(SelectItem, { value: "capacity", children: "Capacity" }), _jsx(SelectItem, { value: "name", children: "Room Name" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Price Range" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Slider, { min: 0, max: 10000000, step: 100000, value: [filters.priceRange[0], filters.priceRange[1]], onValueChange: handlePriceChange, className: "w-full" }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "font-medium", children: filters.priceRange[0].toLocaleString("vi-VN") }), _jsx("span", { className: "text-gray-500", children: "to" }), _jsx("span", { className: "font-medium", children: filters.priceRange[1].toLocaleString("vi-VN") })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Number of Guests" }) }), _jsx(CardContent, { children: _jsxs(Select, { value: filters.capacity?.toString() || "all", onValueChange: handleCapacityChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All" }), _jsx(SelectItem, { value: "1", children: "1 guest" }), _jsx(SelectItem, { value: "2", children: "2 guests" }), _jsx(SelectItem, { value: "3", children: "3 guests" }), _jsx(SelectItem, { value: "4", children: "4+ guests" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Room Types" }) }), _jsx(CardContent, { className: "space-y-3", children: ["Deluxe", "Suite", "Standard"].map((type) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: type, checked: filters.roomTypes.includes(type), onCheckedChange: (checked) => handleRoomTypeChange(type, checked) }), _jsx(Label, { htmlFor: type, className: "text-sm font-normal cursor-pointer", children: type })] }, type))) })] }), _jsx(Button, { onClick: handleReset, variant: "outline", className: "w-full", children: "Reset Filters" })] }));
}
//# sourceMappingURL=room-filters.js.map