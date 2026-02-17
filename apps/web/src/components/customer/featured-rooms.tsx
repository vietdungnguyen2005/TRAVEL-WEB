import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  // `rooms` is still passed from the home page today.
  // Keep it for future reuse without changing the page contract.
  void rooms;

  const destinations: Array<{ name: string; imageUrl: string; showCta?: boolean }> = [
    { name: "Hà Nội", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop" },
    { name: "TP. Hồ Chí Minh", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop" },
    { name: "Đà Nẵng", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop" },
    { name: "Nha Trang", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop" },
    { name: "Hội An", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop", showCta: true },
    { name: "Đà Lạt", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop" },
    { name: "Phú Quốc", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop" },
    { name: "Hạ Long", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop" },
    { name: "Huế", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop" },
    { name: "Sa Pa", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop" },
    { name: "Quy Nhơn", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop" },
    { name: "Vũng Tàu", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Best hotel deals in popular destination</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => {
            const CardInner = (
              <div className="group relative h-44 md:h-48 lg:h-52 overflow-hidden rounded-xl">
                <Image
                  src={d.imageUrl}
                  alt={d.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35 transition-opacity duration-200 group-hover:opacity-45" />

                <div className="absolute left-4 top-4">
                  <div className="text-white font-semibold">{d.name}</div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-1 scale-[0.98] transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 pointer-events-none">
                  <Button
                    asChild
                    variant="outline"
                    className="bg-transparent text-white border-white/80 hover:bg-white/10"
                  >
                    <span>See more accommodation</span>
                  </Button>
                </div>
              </div>
            );

            return (
              <Link key={d.name} href="/rooms" className={cn("block")}
              >
                {CardInner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
