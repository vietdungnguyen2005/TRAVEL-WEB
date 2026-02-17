import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  variant?: "grid" | "list";
}

export function RoomCard({ room, variant = "grid" }: RoomCardProps) {
  const images = Array.isArray(room.images) ? room.images : [];
  const sizeText = typeof room.size === "number" ? `${room.size}m²` : "-";
  const capacityText = typeof room.capacity === "number" ? `${room.capacity} guests` : "-";
  const bedCountText = typeof room.bedCount === "number" ? `${room.bedCount} beds` : "-";

  if (variant === "list") {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-44 w-full md:h-40 md:w-56 shrink-0">
            <Image
              src={images[0] || "/placeholder-room.jpg"}
              alt={room.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 224px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-room.jpg";
              }}
            />
            {room.featured && (
              <Badge className="absolute left-3 top-3">Featured</Badge>
            )}
          </div>

          <div className="flex-1 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug truncate">{room.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {room.description}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
          </div>

          <div className="w-full md:w-56 p-4 md:p-5 border-t md:border-t-0 md:border-l flex md:flex-col items-start md:items-end justify-between md:justify-start gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price / night</div>
              <div className="text-xl font-bold text-primary">
                {Number(room.pricePerNight).toLocaleString("vi-VN")} VND
              </div>
            </div>

            <Button asChild className="w-full md:w-auto">
              <Link href={`/rooms/${room.id}`}>See Availability</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 w-full">
        <Image
          src={images[0] || "/placeholder-room.jpg"}
          alt={room.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-room.jpg';
          }}
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
              {Number(room.pricePerNight).toLocaleString("vi-VN")} VND
            </p>
            <p className="text-sm text-gray-500">/ night</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/rooms/${room.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
