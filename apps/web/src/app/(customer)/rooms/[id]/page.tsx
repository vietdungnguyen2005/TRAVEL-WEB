import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { ImageGallery } from "@/components/customer/image-gallery";
import { BookingFormClient } from "@/components/customer/booking-form-client"; import { ReviewsList } from "@/components/reviews/reviews-list"; import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Bed, Maximize, Wifi, Tv, Wind, Coffee, CheckCircle } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

const amenityIcons: Record<string, any> = {
  "Wifi": Wifi,
  "TV": Tv,
  "AC": Wind,
  "Air Conditioning": Wind,
  "Mini Bar": Coffee,
  "Coffee Maker": Coffee,
};

async function getRoomType(id: string) {
  try {
    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { status: "AVAILABLE" },
        },
      },
    });

    return roomType;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Prisma error fetching room type:', err);
    return null;
  }
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const roomType = await getRoomType(id);

  if (!roomType) {
    notFound();
  }

  const availableRoomsCount = roomType.rooms.length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={roomType.images} roomName={roomType.name} />

            {/* Room Title & Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{roomType.name}</h1>

                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Up to {roomType.capacity} guests</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{roomType.bedCount} {roomType.bedCount === 1 ? "bed" : "beds"}</span>
                    </div>

                    {roomType.size && (
                      <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" />
                        <span>{roomType.size}sqm</span>
                      </div>
                    )}
                  </div>
                </div>

                {roomType.featured && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                )}
              </div>
            </div>

            {availableRoomsCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <CheckCircle className="inline h-4 w-4 mr-2" />
                {availableRoomsCount} {availableRoomsCount === 1 ? "room" : "rooms"} available
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Room</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {roomType.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roomType.amenities?.map((amenity: any) => {
                    const Icon = amenityIcons[amenity] || CheckCircle;
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Room Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">After 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">Before 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation</span>
                  <span className="font-medium">Free cancellation up to 24 hours before check-in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Smoking</span>
                  <span className="font-medium">Non-smoking room</span>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Guest Reviews</h2>
              <ReviewsList roomTypeId={roomType.id} />
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <BookingFormClient
              roomTypeId={roomType.id}
              basePrice={Number(roomType.pricePerNight)}
              capacity={roomType.capacity}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
