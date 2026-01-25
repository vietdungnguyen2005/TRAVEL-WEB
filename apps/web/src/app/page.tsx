import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/customer/hero-section";
import { FeaturedRooms } from "@/components/customer/featured-rooms";
import { Features } from "@/components/customer/features";
import { findRoomTypes } from "@/lib/prisma";

export default async function Home() {
  let featuredRooms = [] as any[];
  try {
    featuredRooms = await findRoomTypes({
      where: {
        featured: true,
        available: true,
      },
      take: 3,
      orderBy: {
        pricePerNight: "asc",
      },
    });
  } catch (err) {
    // If Prisma is not reachable in dev, return empty list instead of crashing SSR
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error('Prisma error on Home page:', err);
    featuredRooms = [];
  }

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
