"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoomsSortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sortBy") || "price-asc") as
    | "price-asc"
    | "price-desc"
    | "capacity"
    | "name";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-w-[160px]">
      <Select value={currentSort} onValueChange={handleChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="capacity">Capacity</SelectItem>
          <SelectItem value="name">Room Name</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
