"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RoomFilters, FilterState } from "./room-filters";

interface RoomFiltersClientProps {
  initialParams: any;
}

export function RoomFiltersClient({ initialParams }: RoomFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseCsv = (value: any): string[] => {
    if (!value || typeof value !== "string") return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseNumberCsv = (value: any): number[] => {
    const parts = parseCsv(value);
    return parts
      .map((p) => Number(p))
      .filter((n) => Number.isFinite(n));
  };

  // Parse initial filters from URL
  const initialFilters: FilterState = {
    priceRange: [
      parseInt(initialParams.minPrice || "0"),
      parseInt(initialParams.maxPrice || "10000000"),
    ],
    capacity: initialParams.capacity ? parseInt(initialParams.capacity) : null,
    location: initialParams.location || "",
    roomTypes: initialParams.roomTypes ? initialParams.roomTypes.split(",") : [],
    promoDiscounts: parseCsv(initialParams.promoDiscounts),
    starRatings: parseNumberCsv(initialParams.starRatings),
    guestRatings: parseCsv(initialParams.guestRatings),
    accommodationTypes: parseCsv(initialParams.accommodationTypes),
    popularFacilities: parseCsv(initialParams.popularFacilities),
    moreFlexibility: parseCsv(initialParams.moreFlexibility),
    uniqueFacilities: parseCsv(initialParams.uniqueFacilities),
    roomFacilities: parseCsv(initialParams.roomFacilities),
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

    // Update location
    if (filters.location) {
      params.set("location", filters.location);
    } else {
      params.delete("location");
    }

    const setCsvParam = (key: string, values: Array<string | number>) => {
      if (values.length > 0) params.set(key, values.join(","));
      else params.delete(key);
    };

    setCsvParam("promoDiscounts", filters.promoDiscounts);
    setCsvParam("starRatings", filters.starRatings);
    setCsvParam("guestRatings", filters.guestRatings);
    setCsvParam("accommodationTypes", filters.accommodationTypes);
    setCsvParam("popularFacilities", filters.popularFacilities);
    setCsvParam("moreFlexibility", filters.moreFlexibility);
    setCsvParam("uniqueFacilities", filters.uniqueFacilities);
    setCsvParam("roomFacilities", filters.roomFacilities);

    // Preserve search params from homepage
    if (initialParams.checkIn) params.set("checkIn", initialParams.checkIn);
    if (initialParams.checkOut) params.set("checkOut", initialParams.checkOut);
    if (initialParams.guests) params.set("guests", initialParams.guests);

    router.push(`/rooms?${params.toString()}`);
  };

  return <RoomFilters onFilterChange={handleFilterChange} initialFilters={initialFilters} />;
}
