/**
 * Seed test data: create COMPLETED bookings (past dates) for a specific user
 * so they can test the review feature.
 *
 * Usage:
 *   cd services/booking-service
 *   npx tsx ../../scripts/seed-test-reviews.ts
 */
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';

// Load booking-service .env for DATABASE_URL
config({ path: path.join(__dirname, '..', 'services', 'booking-service', '.env') });

if (!process.env.BOOKING_DATABASE_URL && process.env.DATABASE_URL) {
    process.env.BOOKING_DATABASE_URL = process.env.DATABASE_URL;
}

// Use booking-service Prisma client (it can cross-query schemas)
import { PrismaClient } from '../services/booking-service/node_modules/.prisma/booking-client';

const prisma = new PrismaClient();

const TARGET_EMAIL = '23520337@gm.uit.edu.vn';

async function main() {
    console.log(`\nSeeding test review data for ${TARGET_EMAIL}...\n`);

    // 1. Find user in auth schema
    const users = await prisma.$queryRawUnsafe<{ id: string; email: string; name: string | null }[]>(
        `SELECT id, email, name FROM app_auth."User" WHERE email = $1 LIMIT 1`,
        TARGET_EMAIL,
    );

    if (users.length === 0) {
        console.error(`User ${TARGET_EMAIL} not found in app_auth.User.`);
        console.log('Make sure the user has logged in with Google at least once.');
        return;
    }

    const user = users[0];
    console.log(`Found user: ${user.email} (${user.name || 'no name'}) — id: ${user.id}`);

    // 2. Get rooms with their room types
    const rooms = await prisma.$queryRawUnsafe<{
        id: string;
        roomNumber: string;
        roomTypeId: string;
        roomTypeName: string;
    }[]>(
        `SELECT r.id, r."roomNumber", r."roomTypeId", rt.name AS "roomTypeName"
         FROM room."Room" r
         JOIN room."RoomType" rt ON r."roomTypeId" = rt.id
         WHERE r.status = 'AVAILABLE'
         ORDER BY rt."basePrice" ASC
         LIMIT 5`,
    );

    if (rooms.length === 0) {
        console.error('No rooms found in room.Room — run room-service seed first.');
        return;
    }

    console.log(`Found ${rooms.length} available rooms`);

    // 3. Check existing COMPLETED bookings for this user
    const existing = await prisma.booking.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
    });
    console.log(`User already has ${existing.length} COMPLETED bookings`);

    if (existing.length >= 3) {
        console.log('User already has enough COMPLETED bookings for testing reviews.');
        console.log('Booking IDs:');
        for (const b of existing) {
            console.log(`  ${b.id} — room ${b.roomId}`);
        }
        return;
    }

    // 4. Create past bookings with COMPLETED status
    const pastBookings = [
        {
            id: randomUUID(),
            roomId: rooms[0].id,
            userId: user.id,
            checkIn: new Date('2026-01-15'),
            checkOut: new Date('2026-01-18'),
            numberOfGuests: 2,
            totalPrice: 2400000,
            status: 'COMPLETED' as const,
            paymentStatus: 'PAID',
        },
        {
            id: randomUUID(),
            roomId: rooms.length > 1 ? rooms[1].id : rooms[0].id,
            userId: user.id,
            checkIn: new Date('2026-02-10'),
            checkOut: new Date('2026-02-14'),
            numberOfGuests: 1,
            totalPrice: 3200000,
            status: 'COMPLETED' as const,
            paymentStatus: 'PAID',
        },
        {
            id: randomUUID(),
            roomId: rooms.length > 2 ? rooms[2].id : rooms[0].id,
            userId: user.id,
            checkIn: new Date('2026-02-25'),
            checkOut: new Date('2026-02-28'),
            numberOfGuests: 3,
            totalPrice: 5600000,
            status: 'COMPLETED' as const,
            paymentStatus: 'PAID',
        },
    ];

    // Filter out bookings for rooms that already have a COMPLETED booking from this user
    const existingRoomIds = new Set(existing.map((b) => b.roomId));
    const newBookings = pastBookings.filter((b) => !existingRoomIds.has(b.roomId));

    if (newBookings.length === 0) {
        console.log('All rooms already have COMPLETED bookings for this user.');
        return;
    }

    for (const b of newBookings) {
        await prisma.booking.create({ data: b });
        const rm = rooms.find((r) => r.id === b.roomId);
        console.log(`  Created COMPLETED booking ${b.id.slice(0, 8)} — ${rm?.roomTypeName || 'unknown'} (room ${rm?.roomNumber})`);
    }

    // 5. Create matching payments in payment schema
    for (const b of newBookings) {
        try {
            await prisma.$executeRawUnsafe(
                `INSERT INTO payment."Payment" (id, "bookingId", "userId", amount, currency, status, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, 'vnd', 'COMPLETED', NOW(), NOW())
                 ON CONFLICT ("bookingId") DO NOTHING`,
                randomUUID(),
                b.id,
                b.userId,
                b.totalPrice,
            );
        } catch (err) {
            console.warn(`  Warning: Could not create payment for booking ${b.id.slice(0, 8)}:`, (err as Error).message);
        }
    }

    console.log(`\nDone! Created ${newBookings.length} COMPLETED bookings for ${TARGET_EMAIL}`);
    console.log('The user can now go to Dashboard → Reviews to write reviews for these bookings.\n');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
