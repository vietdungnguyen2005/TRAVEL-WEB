import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/customer/hero-section";
import { FeaturedRooms } from "@/components/customer/featured-rooms";
import { Features } from "@/components/customer/features";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featuredRooms = await prisma.roomType.findMany({
    where: {
      featured: true,
      available: true,
    },
    take: 3,
    orderBy: {
      pricePerNight: "asc",
    },
  });

  return (
    <MainLayout>
      <HeroSection />
      <Features />
      <FeaturedRooms rooms={featuredRooms.map(room => ({
        ...room,
        pricePerNight: Number(room.pricePerNight)
      }))} />
    </MainLayout>
  );
}
