import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./room-card";

interface Room {
  id: string;
  name: string;
  slug?: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedCount: number;
  size: number | null;
  images: string[];
  featured: boolean;
}

interface FeaturedRoomsProps {
  rooms: Room[];
}

export function FeaturedRooms({ rooms }: FeaturedRoomsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Rooms
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our most popular rooms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={{
              ...room,
              slug: room.slug || '',
            }} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/rooms">View All Rooms</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
