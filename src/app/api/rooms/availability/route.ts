import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findAvailableRooms } from '@/lib/booking-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomTypeId, checkIn, checkOut } = body;

    if (!roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    const availableRooms = await findAvailableRooms(
      roomTypeId,
      checkInDate,
      checkOutDate
    );

    return NextResponse.json({
      available: availableRooms.length > 0,
      count: availableRooms.length,
      rooms: availableRooms.map((room: any) => ({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        view: room.view,
      })),
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
