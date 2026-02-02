import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Users, Bed, Maximize } from "lucide-react";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    bedCount: number;
    size: number | null;
    images: string[];
    featured?: boolean;
  };
}

export function RoomCard({ room }: RoomCardProps) {
  const images = Array.isArray(room.images) ? room.images : [];
  const sizeText = typeof room.size === "number" ? `${room.size}m²` : "-";
  const capacityText = typeof room.capacity === "number" ? `${room.capacity} guests` : "-";
  const bedCountText = typeof room.bedCount === "number" ? `${room.bedCount} beds` : "-";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 w-full">
        <Image
          src={images[0] || "/placeholder-room.jpg"}
          alt={room.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {room.featured && (
          <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{capacityText}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedCountText}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{sizeText}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">
              {Number(room.pricePerNight).toLocaleString("vi-VN")}d
            </p>
            <p className="text-sm text-gray-500">/ night</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/rooms/${room.id}`} className="w-full">
          <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
            View Details
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
