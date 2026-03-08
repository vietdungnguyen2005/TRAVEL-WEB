import { Suspense } from "react";
import { gatewayFetch } from "@/lib/gateway-client";
import { MainLayout } from "@/components/layout/main-layout";
import { RoomCard } from "@/components/customer/room-card";
import { RoomFiltersClient } from "@/components/customer/room-filters-client";
import { RoomsSortBar } from "@/components/customer/rooms-sort-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { CalendarDays, Users, MapPin } from "lucide-react";

interface PageProps {
  searchParams: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    capacity?: string;
    roomTypes?: string;
    sortBy?: string;
  };
}

async function getRooms(searchParams: PageProps["searchParams"]) {
  const params = await searchParams;
  const {
    minPrice,
    maxPrice,
    capacity,
    roomTypes,
    location,
    sortBy = "price-asc",
  } = params;

  const where: any = {
    available: true,
  };

  if (minPrice || maxPrice) {
    where.pricePerNight = {};
    if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
    if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
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

  try {
    const qs = new URLSearchParams();
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (capacity) qs.set("capacity", capacity);
    if (roomTypes) qs.set("roomTypes", roomTypes);
    if (location) qs.set("location", location);
    if (sortBy) qs.set("sortBy", sortBy);

    const path = `/api/rooms${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await gatewayFetch(path, { method: "GET", cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    const rooms = Array.isArray(data) ? data : data?.data ?? [];
    return Array.isArray(rooms) ? rooms : [];
  } catch (err) {
    console.error("Error fetching rooms:", err);
    return [];
  }
}

function RoomListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-36 w-56 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-3 py-1">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <div className="w-56 space-y-3 py-1">
            <Skeleton className="h-6 w-28 ml-auto" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function RoomList({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const rooms = await getRooms(searchParams);
  const params = await searchParams;
  const { checkIn, checkOut, guests, location } = params;

  const checkInText = checkIn ? new Date(checkIn).toLocaleDateString("vi-VN") : "Select dates";
  const checkOutText = checkOut ? new Date(checkOut).toLocaleDateString("vi-VN") : "Select dates";
  const guestsText = guests ? `${guests} guest${Number(guests) === 1 ? "" : "s"}` : "Guests";
  const locationText = location || "Tất cả địa điểm";

  return (
    <>
      <Card className="mb-6 p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="text-muted-foreground">Địa điểm</div>
              <div className="font-medium">{locationText}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="text-muted-foreground">Check-in & Check-out</div>
              <div className="font-medium">{checkInText} - {checkOutText}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="text-muted-foreground">Guests</div>
              <div className="font-medium">{guestsText}</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
            <div className="text-sm">
              <div className="text-muted-foreground">Results</div>
              <div className="font-medium">{rooms.length} room{rooms.length === 1 ? "" : "s"}</div>
            </div>
            <RoomsSortBar />
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {rooms.length > 0 ? "Popular Rooms" : "No rooms found"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {rooms.length > 0
            ? "Compare prices and choose your stay"
            : "Try adjusting filters or searching with different criteria."}
        </p>
      </div>

      {rooms.length > 0 ? (
        <div className="space-y-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={{
              ...room,
              pricePerNight: Number(room.pricePerNight)
            }} variant="list" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-background p-10 text-center">
          <p className="text-lg font-semibold">No rooms match your search criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters or search with different criteria.
          </p>
        </div>
      )}
    </>
  );
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
              </div>
              <RoomFiltersClient initialParams={params} />
            </div>
          </aside>

          <main className="lg:col-span-9">
            <Suspense fallback={<RoomListSkeleton />}>
              <RoomList searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
