export const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'ON_HOLD'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
    id: string;
    userId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    totalPrice: unknown;
    status: BookingStatus;
    paymentStatus: string | null;
    holdExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
