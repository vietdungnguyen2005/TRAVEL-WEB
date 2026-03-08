import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.BOOKING_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.BOOKING_DATABASE_URL = process.env.DATABASE_URL;
}

import { PrismaClient } from '../node_modules/.prisma/booking-client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding booking-service...');

  // We need real userId and roomId values from auth-service and room-service.
  // Query from a shared Supabase DB (all schemas live in the same Postgres instance).
  // Use Prisma.$queryRawUnsafe to reach across schemas.

  // Get admin user ID
  const users = await prisma.$queryRawUnsafe<{ id: string; email: string }[]>(
    `SELECT id, email FROM app_auth."User" LIMIT 5`
  );
  if (users.length === 0) {
    console.log('No users found in app_auth.User — run auth-service seed first.');
    return;
  }

  // Get room IDs
  const rooms = await prisma.$queryRawUnsafe<{ id: string; "roomNumber": string }[]>(
    `SELECT id, "roomNumber" FROM room."Room" LIMIT 10`
  );
  if (rooms.length === 0) {
    console.log('No rooms found in room.Room — run room-service seed first.');
    return;
  }

  console.log(`Found ${users.length} users and ${rooms.length} rooms`);

  const userId = users[0].id;

  const bookingsData = [
    {
      roomId: rooms[0].id,
      userId,
      checkIn: new Date('2026-03-10'),
      checkOut: new Date('2026-03-13'),
      numberOfGuests: 2,
      totalPrice: 360,
      status: 'CONFIRMED' as const,
      paymentStatus: 'PAID',
    },
    {
      roomId: rooms.length > 1 ? rooms[1].id : rooms[0].id,
      userId,
      checkIn: new Date('2026-03-15'),
      checkOut: new Date('2026-03-18'),
      numberOfGuests: 1,
      totalPrice: 240,
      status: 'PENDING' as const,
      paymentStatus: 'PENDING',
    },
    {
      roomId: rooms.length > 2 ? rooms[2].id : rooms[0].id,
      userId,
      checkIn: new Date('2026-02-01'),
      checkOut: new Date('2026-02-05'),
      numberOfGuests: 3,
      totalPrice: 880,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID',
    },
    {
      roomId: rooms.length > 3 ? rooms[3].id : rooms[0].id,
      userId,
      checkIn: new Date('2026-01-20'),
      checkOut: new Date('2026-01-22'),
      numberOfGuests: 2,
      totalPrice: 160,
      status: 'CANCELLED' as const,
      paymentStatus: 'PENDING',
    },
    {
      roomId: rooms.length > 4 ? rooms[4].id : rooms[0].id,
      userId,
      checkIn: new Date('2026-04-01'),
      checkOut: new Date('2026-04-05'),
      numberOfGuests: 4,
      totalPrice: 480,
      status: 'CONFIRMED' as const,
      paymentStatus: 'PAID',
    },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }

  console.log(`Created ${bookingsData.length} bookings`);
  console.log('booking-service seed complete');
}

main()
  .catch((e) => {
    console.error('Booking seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
