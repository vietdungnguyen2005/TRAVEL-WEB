import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  checkRoomAvailability,
  calculateTotalPrice,
  createHoldBooking
} from '@/lib/booking-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      roomId,
      checkIn,
      checkOut,
      numberOfGuests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    } = body;

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate guest number
    if (numberOfGuests < 1 || numberOfGuests > 20) {
      return NextResponse.json(
        { error: 'Number of guests must be between 1 and 20' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Prevent booking in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    // Prevent booking too far in advance (e.g., max 1 year)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (checkInDate > maxDate) {
      return NextResponse.json(
        { error: 'Check-in date cannot be more than 1 year in advance' },
        { status: 400 }
      );
    }

    // Use transaction to prevent race conditions
    const booking = await prisma.$transaction(async (tx: any) => {
      // Check room availability inside transaction
      const isAvailable = await tx.booking.findFirst({
        where: {
          roomId,
          status: {
            in: ["CONFIRMED", "ON_HOLD"],
          },
          OR: [
            {
              checkIn: {
                gte: checkInDate,
                lt: checkOutDate,
              },
            },
            {
              checkOut: {
                gt: checkInDate,
                lte: checkOutDate,
              },
            },
            {
              AND: [
                {
                  checkIn: {
                    lte: checkInDate,
                  },
                },
                {
                  checkOut: {
                    gte: checkOutDate,
                  },
                },
              ],
            },
          ],
        },
      });

      if (isAvailable) {
        throw new Error('Room is not available for selected dates');
      }

      // Get room details
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // Validate capacity
      if (numberOfGuests > room.roomType.capacity) {
        throw new Error(`Room capacity is ${room.roomType.capacity} guests`);
      }

      // Calculate total price with seasonal pricing
      const totalPrice = await calculateTotalPrice(
        room.roomTypeId,
        checkInDate,
        checkOutDate
      );

      // Create booking with ON_HOLD status
      const holdExpiresAt = new Date();
      holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);

      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          numberOfGuests,
          totalPrice,
          status: "ON_HOLD",
          holdExpiresAt,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        totalPrice: booking.totalPrice,
        holdExpiresAt: booking.holdExpiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof Error && error.message === 'Room is not available for selected dates') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
