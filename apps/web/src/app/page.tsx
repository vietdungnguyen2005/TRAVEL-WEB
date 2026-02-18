import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/customer/hero-section";
import { FeaturedRooms } from "@/components/customer/featured-rooms";
import { Features } from "@/components/customer/features";
import { gatewayFetch } from "@/lib/gateway-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredRooms = [] as any[];
  try {
    // UI-only: load data from gateway instead of Prisma
    const res = await gatewayFetch("/api/rooms", {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      featuredRooms = Array.isArray(data) ? data : data?.data ?? [];
      // Best-effort filters on client side if gateway doesn't support query params yet
      featuredRooms = featuredRooms
        .filter((r: any) => r?.featured && r?.available)
        .sort((a: any, b: any) => Number(a?.pricePerNight ?? 0) - Number(b?.pricePerNight ?? 0))
        .slice(0, 3);
    } else {
      console.warn("Failed to fetch rooms:", res.status, res.statusText);
      featuredRooms = [];
    }
  } catch (err) {
    console.error("Error loading featured rooms:", err);
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
