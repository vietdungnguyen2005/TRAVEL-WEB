import { MainLayout } from "@/components/layout/main-layout";

export const dynamic = "force-dynamic";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
