"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface RoomFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  priceRange: [number, number];
  capacity: number | null;
  roomTypes: string[];
  promoDiscounts: string[];
  starRatings: number[];
  guestRatings: string[];
  accommodationTypes: string[];
  popularFacilities: string[];
  moreFlexibility: string[];
  uniqueFacilities: string[];
  roomFacilities: string[];
}

export function RoomFilters({ onFilterChange, initialFilters }: RoomFiltersProps) {
  const defaultFilters: FilterState = {
    priceRange: [0, 10000000],
    capacity: null,
    roomTypes: [],
    promoDiscounts: [],
    starRatings: [],
    guestRatings: [],
    accommodationTypes: [],
    popularFacilities: [],
    moreFlexibility: [],
    uniqueFacilities: [],
    roomFacilities: [],
  };

  const [draftFilters, setDraftFilters] = useState<FilterState>(
    initialFilters || defaultFilters
  );

  const promoOptions = useMemo(
    () => [
      "Top Favourite",
      "Promo for You",
      "Breakfast included",
      "Family/Kid friendly",
      "Valentine Sale",
      "Pay at hotel deal",
      "Last minute deal",
    ],
    []
  );

  const guestRatingOptions = useMemo(
    () => [
      { key: "7+", label: "7+ Convenient" },
      { key: "8+", label: "8+ Impressive" },
      { key: "9+", label: "9+ Superb" },
    ],
    []
  );

  const accommodationOptions = useMemo(
    () => ["Homestay", "Hotel", "Ryokan", "Apartments", "Guesthouse", "Resort", "Villa"],
    []
  );

  const popularFacilitiesOptions = useMemo(
    () => [
      "Restaurant",
      "Breakfast Available",
      "Early Check-In",
      "Airport Transfer",
      "Late Check-Out",
      "Swimming Pool",
      "Parking",
    ],
    []
  );

  const flexibilityOptions = useMemo(
    () => ["Free Cancellation", "Pay at Hotel"],
    []
  );

  const uniqueFacilitiesOptions = useMemo(
    () => [
      "Shopping Area",
      "Bars & Pub",
      "Entertainment Area",
      "Indoor Sports",
      "Tennis",
      "Spa",
    ],
    []
  );

  const roomFacilitiesOptions = useMemo(
    () => [
      "Air Conditioning",
      "Non Smoking Room",
      "Hair Dryer",
      "Family Room",
      "Refrigerator",
      "TV",
      "Wifi",
    ],
    []
  );

  const [showAllPromo, setShowAllPromo] = useState(false);
  const [showAllAccommodation, setShowAllAccommodation] = useState(false);
  const [showAllPopularFacilities, setShowAllPopularFacilities] = useState(false);
  const [showAllUniqueFacilities, setShowAllUniqueFacilities] = useState(false);
  const [showAllRoomFacilities, setShowAllRoomFacilities] = useState(false);

  useEffect(() => {
    setDraftFilters(initialFilters || defaultFilters);
  }, [initialFilters]);

  const hasChanges =
    draftFilters.priceRange[0] !== (initialFilters?.priceRange?.[0] ?? defaultFilters.priceRange[0]) ||
    draftFilters.priceRange[1] !== (initialFilters?.priceRange?.[1] ?? defaultFilters.priceRange[1]) ||
    (draftFilters.capacity ?? null) !== (initialFilters?.capacity ?? null) ||
    draftFilters.roomTypes.join(",") !== (initialFilters?.roomTypes ?? []).join(",") ||
    draftFilters.promoDiscounts.join(",") !== (initialFilters?.promoDiscounts ?? []).join(",") ||
    draftFilters.starRatings.join(",") !== (initialFilters?.starRatings ?? []).join(",") ||
    draftFilters.guestRatings.join(",") !== (initialFilters?.guestRatings ?? []).join(",") ||
    draftFilters.accommodationTypes.join(",") !== (initialFilters?.accommodationTypes ?? []).join(",") ||
    draftFilters.popularFacilities.join(",") !== (initialFilters?.popularFacilities ?? []).join(",") ||
    draftFilters.moreFlexibility.join(",") !== (initialFilters?.moreFlexibility ?? []).join(",") ||
    draftFilters.uniqueFacilities.join(",") !== (initialFilters?.uniqueFacilities ?? []).join(",") ||
    draftFilters.roomFacilities.join(",") !== (initialFilters?.roomFacilities ?? []).join(",");

  const handleMultiSelectChange = (key: keyof FilterState, value: string, checked: boolean) => {
    setDraftFilters((prev) => {
      const current = prev[key] as any;
      if (!Array.isArray(current)) return prev;
      const next = checked ? [...current, value] : current.filter((v: string) => v !== value);
      return { ...prev, [key]: next } as FilterState;
    });
  };

  const handleMultiSelectNumberChange = (key: keyof FilterState, value: number, checked: boolean) => {
    setDraftFilters((prev) => {
      const current = prev[key] as any;
      if (!Array.isArray(current)) return prev;
      const next = checked ? [...current, value] : current.filter((v: number) => v !== value);
      return { ...prev, [key]: next } as FilterState;
    });
  };

  const handlePriceChange = (value: number[]) => {
    setDraftFilters((prev) => ({ ...prev, priceRange: [value[0], value[1]] as [number, number] }));
  };

  const handleCapacityChange = (value: string) => {
    setDraftFilters((prev) => ({ ...prev, capacity: value === "all" ? null : parseInt(value) }));
  };

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    setDraftFilters((prev) => {
      const nextRoomTypes = checked
        ? [...prev.roomTypes, roomType]
        : prev.roomTypes.filter((t) => t !== roomType);
      return { ...prev, roomTypes: nextRoomTypes };
    });
  };

  const handleReset = () => {
    setDraftFilters(defaultFilters);
  };

  const handlePriceReset = () => {
    setDraftFilters((prev) => ({ ...prev, priceRange: defaultFilters.priceRange }));
  };

  const handleApply = () => {
    onFilterChange(draftFilters);
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="mb-3">
        <div className="text-lg font-bold">Filters</div>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={[
            "price",
            "promo",
            "star",
            "guest",
            "accommodation",
            "popular",
            "flex",
            "unique",
            "roomFacilities",
            "guests",
            "types",
          ]}
        >
          <AccordionItem value="price" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex w-full items-center justify-between pr-2">
                <div>
                  <div className="font-semibold">Price Range</div>
                  <div className="text-xs text-muted-foreground">Per room, per night</div>
                </div>
                <span
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto p-0")}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePriceReset();
                  }}
                >
                  Reset
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={10000000}
                  step={100000}
                  value={[draftFilters.priceRange[0], draftFilters.priceRange[1]]}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />

                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <div className="rounded-md border bg-background px-2 py-1 text-center">
                    {draftFilters.priceRange[0].toLocaleString("vi-VN")}
                  </div>
                  <div className="text-center text-muted-foreground">to</div>
                  <div className="rounded-md border bg-background px-2 py-1 text-center">
                    {draftFilters.priceRange[1].toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="promo" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Promo & Discount</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {(showAllPromo ? promoOptions : promoOptions.slice(0, 5)).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`promo-${opt}`}
                      checked={draftFilters.promoDiscounts.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("promoDiscounts", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`promo-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setShowAllPromo((v) => !v)}
                >
                  {showAllPromo ? "See less" : "See All"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="star" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Star Rating</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <Checkbox
                      id={`star-${star}`}
                      checked={draftFilters.starRatings.includes(star)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectNumberChange("starRatings", star, checked as boolean)
                      }
                    />
                    <Label htmlFor={`star-${star}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <span className="font-medium">{star}</span>
                      <span className="text-primary">{"★".repeat(star)}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guest" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Guest Rating</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {guestRatingOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`guest-${opt.key}`}
                      checked={draftFilters.guestRatings.includes(opt.key)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("guestRatings", opt.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={`guest-${opt.key}`} className="text-sm font-normal cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accommodation" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Accommodation Type</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {(showAllAccommodation ? accommodationOptions : accommodationOptions.slice(0, 5)).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accommodation-${opt}`}
                      checked={draftFilters.accommodationTypes.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("accommodationTypes", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`accommodation-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setShowAllAccommodation((v) => !v)}
                >
                  {showAllAccommodation ? "See less" : "See All"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="popular" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Popular Facilities</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {(showAllPopularFacilities ? popularFacilitiesOptions : popularFacilitiesOptions.slice(0, 5)).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`popular-${opt}`}
                      checked={draftFilters.popularFacilities.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("popularFacilities", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`popular-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setShowAllPopularFacilities((v) => !v)}
                >
                  {showAllPopularFacilities ? "See less" : "See All"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="flex" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">More Flexibility</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {flexibilityOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`flex-${opt}`}
                      checked={draftFilters.moreFlexibility.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("moreFlexibility", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`flex-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="unique" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Unique Facilities</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {(showAllUniqueFacilities ? uniqueFacilitiesOptions : uniqueFacilitiesOptions.slice(0, 5)).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unique-${opt}`}
                      checked={draftFilters.uniqueFacilities.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("uniqueFacilities", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`unique-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setShowAllUniqueFacilities((v) => !v)}
                >
                  {showAllUniqueFacilities ? "See less" : "See All"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="roomFacilities" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Room Facilities</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {(showAllRoomFacilities ? roomFacilitiesOptions : roomFacilitiesOptions.slice(0, 5)).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`roomFacilities-${opt}`}
                      checked={draftFilters.roomFacilities.includes(opt)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange("roomFacilities", opt, checked as boolean)
                      }
                    />
                    <Label htmlFor={`roomFacilities-${opt}`} className="text-sm font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setShowAllRoomFacilities((v) => !v)}
                >
                  {showAllRoomFacilities ? "See less" : "See All"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guests" className="border-b">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Number of Guests</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Select
                value={draftFilters.capacity?.toString() || "all"}
                onValueChange={handleCapacityChange}
              >
                <SelectTrigger className="h-10">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="types" className="border-b-0">
            <AccordionTrigger className="px-4 py-3">
              <div>
                <div className="font-semibold">Room Types</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {["Deluxe", "Suite", "Standard"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={draftFilters.roomTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        handleRoomTypeChange(type, checked as boolean)
                      }
                    />
                    <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className={cn("mt-3 rounded-xl border bg-background p-3", "sticky bottom-2")}>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" className="rounded-full" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" className="rounded-full" onClick={handleApply} disabled={!hasChanges}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
