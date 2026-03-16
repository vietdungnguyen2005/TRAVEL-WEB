import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { MainLayout } from "@/components/layout/main-layout";

export const dynamic = "force-dynamic";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  return <MainLayout>{children}</MainLayout>;
}
