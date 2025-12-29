import { Role, BookingStatus } from "@prisma/client";

// Re-export Prisma enums
export { Role, BookingStatus };

// Booking types
export interface BookingFormData {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
}

export interface AvailabilityCheckParams {
  roomTypeId?: string;
  checkIn: Date;
  checkOut: Date;
}

// Room types
export interface RoomWithType {
  id: string;
  roomNumber: string;
  floor?: number;
  view?: string;
  status: string;
  roomType: {
    id: string;
    name: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    amenities: string[];
    images: string[];
  };
}

// Admin Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  occupancyRate: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingCheckIns: number;
}
