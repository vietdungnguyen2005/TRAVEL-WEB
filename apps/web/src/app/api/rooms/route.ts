import { NextResponse } from 'next/server';
import { findRoomTypesWithRooms } from '@/lib/prisma';

export async function GET() {
  try {
    const roomTypes = await findRoomTypesWithRooms({
      where: { available: true },
      include: { rooms: { where: { status: 'AVAILABLE' } } },
      orderBy: { pricePerNight: 'asc' },
    } as any);

    return NextResponse.json(roomTypes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching room types:', error);
    return NextResponse.json({ error: 'Failed to fetch room types' }, { status: 500 });
  }
}
