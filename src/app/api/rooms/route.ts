import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      where: {
        available: true,
      },
      include: {
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
      orderBy: {
        pricePerNight: 'asc',
      },
    });

    return NextResponse.json(roomTypes);
  } catch (error) {
    console.error('Error fetching room types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    );
  }
}
