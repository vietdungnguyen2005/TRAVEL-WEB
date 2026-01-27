import { Suspense } from "react";
import { gatewayFetch } from "@/lib/gateway-client";
import { MainLayout } from "@/components/layout/main-layout";
import { RoomCard } from "@/components/customer/room-card";
import { RoomFiltersClient } from "@/components/customer/room-filters-client";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
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

  let orderBy: any = {};
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

  try {
    const qs = new URLSearchParams();
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (capacity) qs.set("capacity", capacity);
    if (roomTypes) qs.set("roomTypes", roomTypes);
    if (sortBy) qs.set("sortBy", sortBy);

    const path = `/api/rooms${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await gatewayFetch(path, { method: "GET", cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    const rooms = Array.isArray(data) ? data : data?.data ?? [];
    return Array.isArray(rooms) ? rooms : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching rooms:", err);
    return [];
  }
}

function RoomListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

async function RoomList({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const rooms = await getRooms(searchParams);
  const params = await searchParams;
  const { checkIn, checkOut, guests } = params;

  return (
    <>
      {(checkIn || checkOut || guests) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Your search:</span>
            {checkIn && (
              <span className="ml-2">
                Check-in: <strong>{new Date(checkIn).toLocaleDateString("vi-VN")}</strong>
              </span>
            )}
            {checkOut && (
              <span className="ml-2">
                Check-out: <strong>{new Date(checkOut).toLocaleDateString("vi-VN")}</strong>
              </span>
            )}
            {guests && (
              <span className="ml-2">
                Guests: <strong>{guests} people</strong>
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {rooms.length > 0 ? (
            <>
              Found <span className="text-primary">{rooms.length}</span> rooms
            </>
          ) : (
            "No rooms found"
          )}
        </h2>
        <p className="text-gray-600 mt-1">
          Select a room that suits your needs
        </p>
      </div>

      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={{
              ...room,
              pricePerNight: Number(room.pricePerNight)
            }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            No rooms match your search criteria.
          </p>
          <p className="text-sm text-gray-500 mt-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <RoomFiltersClient initialParams={params} />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <Suspense fallback={<RoomListSkeleton />}>
              <RoomList searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
