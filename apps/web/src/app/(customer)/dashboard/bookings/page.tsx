import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingItem } from "@/components/booking/booking-item";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { ClientLayout } from "@/components/layout/client-layout";

export default async function MyBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      room: {
        include: {
          roomType: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Đặt phòng của tôi</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý tất cả các đặt phòng của bạn
              </p>
            </div>
            <Link href="/rooms">
              <Button>Đặt phòng mới</Button>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chưa có đặt phòng nào</h3>
                <p className="text-muted-foreground mb-4">
                  Bạn chưa có đặt phòng nào. Hãy khám phá các phòng của chúng tôi!
                </p>
                <Link href="/rooms">
                  <Button>Khám phá phòng</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
