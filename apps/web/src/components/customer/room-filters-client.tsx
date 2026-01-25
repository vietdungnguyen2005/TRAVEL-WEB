"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RoomFilters, FilterState } from "./room-filters";

interface RoomFiltersClientProps {
  initialParams: any;
}

export function RoomFiltersClient({ initialParams }: RoomFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const initialFilters: FilterState = {
    priceRange: [
      parseInt(initialParams.minPrice || "0"),
      parseInt(initialParams.maxPrice || "10000000"),
    ],
    capacity: initialParams.capacity ? parseInt(initialParams.capacity) : null,
    roomTypes: initialParams.roomTypes ? initialParams.roomTypes.split(",") : [],
    sortBy: (initialParams.sortBy || "price-asc") as FilterState["sortBy"],
  };

  const handleFilterChange = (filters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update price
    params.set("minPrice", filters.priceRange[0].toString());
    params.set("maxPrice", filters.priceRange[1].toString());

    // Update capacity
    if (filters.capacity) {
      params.set("capacity", filters.capacity.toString());
    } else {
      params.delete("capacity");
    }

    // Update room types
    if (filters.roomTypes.length > 0) {
      params.set("roomTypes", filters.roomTypes.join(","));
    } else {
      params.delete("roomTypes");
    }

    // Update sort
    params.set("sortBy", filters.sortBy);

    // Preserve search params from homepage
    if (initialParams.checkIn) params.set("checkIn", initialParams.checkIn);
    if (initialParams.checkOut) params.set("checkOut", initialParams.checkOut);
    if (initialParams.guests) params.set("guests", initialParams.guests);

    router.push(`/rooms?${params.toString()}`);
  };

  return <RoomFilters onFilterChange={handleFilterChange} initialFilters={initialFilters} />;
}
