"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  priceRange: [number, number];
  capacity: number | null;
  roomTypes: string[];
  sortBy: "price-asc" | "price-desc" | "capacity" | "name";
}

export function RoomFilters({ onFilterChange, initialFilters }: RoomFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      priceRange: [0, 10000000],
      capacity: null,
      roomTypes: [],
      sortBy: "price-asc",
    }
  );

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCapacityChange = (value: string) => {
    const newFilters = { ...filters, capacity: value === "all" ? null : parseInt(value) };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    const newRoomTypes = checked
      ? [...filters.roomTypes, roomType]
      : filters.roomTypes.filter((t) => t !== roomType);
    const newFilters = { ...filters, roomTypes: newRoomTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value as FilterState["sortBy"] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 10000000],
      capacity: null,
      roomTypes: [],
      sortBy: "price-asc",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
              <SelectItem value="name">Room Name</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            min={0}
            max={10000000}
            step={100000}
            value={[filters.priceRange[0], filters.priceRange[1]]}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {filters.priceRange[0].toLocaleString("vi-VN")}
            </span>
            <span className="text-gray-500">to</span>
            <span className="font-medium">
              {filters.priceRange[1].toLocaleString("vi-VN")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Number of Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.capacity?.toString() || "all"}
            onValueChange={handleCapacityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">1 guest</SelectItem>
              <SelectItem value="2">2 guests</SelectItem>
              <SelectItem value="3">3 guests</SelectItem>
              <SelectItem value="4">4+ guests</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Deluxe", "Suite", "Standard"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.roomTypes.includes(type)}
                onCheckedChange={(checked) =>
                  handleRoomTypeChange(type, checked as boolean)
                }
              />
              <Label
                htmlFor={type}
                className="text-sm font-normal cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleReset}
        variant="outline"
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  );
}
