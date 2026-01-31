import { PrismaClient } from '../node_modules/.prisma/room-client';

const prisma = new PrismaClient();

async function main() {
    // Idempotent seed: upsert by name/roomNumber where possible.
    const deluxe = await prisma.roomType.upsert({
        where: { id: 'seed-deluxe' },
        update: {},
        create: {
            id: 'seed-deluxe',
            name: 'Deluxe',
            description: 'Deluxe room with modern amenities.',
            basePrice: 120,
            maxGuests: 2,
            amenities: ['Wifi', 'TV', 'AC', 'Coffee Maker'],
            images: [
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
            ],
            isActive: true,
        },
    });

    const suite = await prisma.roomType.upsert({
        where: { id: 'seed-suite' },
        update: {},
        create: {
            id: 'seed-suite',
            name: 'Suite',
            description: 'Spacious suite for families and longer stays.',
            basePrice: 220,
            maxGuests: 4,
            amenities: ['Wifi', 'TV', 'AC', 'Mini Bar'],
            images: [
                'https://images.unsplash.com/photo-1505691723518-36a5ac3b2a57?auto=format&fit=crop&w=1200&q=80',
            ],
            isActive: true,
        },
    });

    const standard = await prisma.roomType.upsert({
        where: { id: 'seed-standard' },
        update: {},
        create: {
            id: 'seed-standard',
            name: 'Standard',
            description: 'Standard room with everything you need.',
            basePrice: 80,
            maxGuests: 2,
            amenities: ['Wifi', 'TV'],
            images: [
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
            ],
            isActive: true,
        },
    });

    const rooms = [
        { roomNumber: '101', roomTypeId: deluxe.id, floor: 1 },
        { roomNumber: '102', roomTypeId: deluxe.id, floor: 1 },
        { roomNumber: '201', roomTypeId: suite.id, floor: 2 },
        { roomNumber: '202', roomTypeId: suite.id, floor: 2 },
        { roomNumber: '301', roomTypeId: standard.id, floor: 3 },
    ];

    for (const r of rooms) {
        await prisma.room.upsert({
            where: { roomNumber: r.roomNumber },
            update: {
                roomTypeId: r.roomTypeId,
                floor: r.floor,
                status: 'AVAILABLE',
            },
            create: {
                roomNumber: r.roomNumber,
                roomTypeId: r.roomTypeId,
                floor: r.floor,
                status: 'AVAILABLE',
            },
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        // eslint-disable-next-line no-console
        console.log('room-service seed complete');
    })
    .catch(async (e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
