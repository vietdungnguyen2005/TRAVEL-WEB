import express from 'express';
import { consulRegisterService } from '@travel-web/shared';
import { PrismaClient } from '../node_modules/.prisma/room-client';

const app = express();
const PORT = process.env.PORT || 3003;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/health', (req, res) => res.send('Room service healthy'));

// Customer-facing: list room types (what the web calls "rooms")
// Query params supported by the web UI:
// - minPrice, maxPrice, capacity, roomTypes (comma-separated by name), sortBy
app.get('/api/rooms', async (req, res) => {
    const minPrice = typeof req.query.minPrice === 'string' ? Number(req.query.minPrice) : undefined;
    const maxPrice = typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : undefined;
    const capacity = typeof req.query.capacity === 'string' ? Number(req.query.capacity) : undefined;
    const roomTypes = typeof req.query.roomTypes === 'string' ? req.query.roomTypes : undefined;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'price-asc';

    const where: any = { isActive: true };

    // basePrice filtering
    if (!Number.isNaN(minPrice as number) || !Number.isNaN(maxPrice as number)) {
        where.basePrice = {};
        if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) where.basePrice.gte = minPrice;
        if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) where.basePrice.lte = maxPrice;
    }

    // capacity -> maxGuests
    if (typeof capacity === 'number' && !Number.isNaN(capacity)) {
        where.maxGuests = capacity >= 4 ? { gte: 4 } : capacity;
    }

    // filter by names
    if (roomTypes) {
        where.name = { in: roomTypes.split(',').map((s) => s.trim()).filter(Boolean) };
    }

    let orderBy: any = { basePrice: 'asc' };
    switch (sortBy) {
        case 'price-desc':
            orderBy = { basePrice: 'desc' };
            break;
        case 'capacity':
            orderBy = { maxGuests: 'desc' };
            break;
        case 'name':
            orderBy = { name: 'asc' };
            break;
        case 'price-asc':
        default:
            orderBy = { basePrice: 'asc' };
            break;
    }

    const types = await prisma.roomType.findMany({
        where,
        orderBy,
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });

    // Map room-service schema -> web expects fields like pricePerNight/capacity/bedCount/etc.
    const data = types.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        pricePerNight: t.basePrice,
        capacity: t.maxGuests,
        bedCount: 1,
        size: null,
        amenities: t.amenities,
        images: t.images,
        featured: false,
        available: t.isActive,
        rooms: t.rooms,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    }));

    res.json({ data });
});

// Customer-facing: room type detail
app.get('/api/rooms/:id', async (req, res) => {
    const { id } = req.params;
    const t = await prisma.roomType.findUnique({
        where: { id },
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });

    if (!t) return res.status(404).json({ message: 'Room type not found' });

    res.json({
        data: {
            id: t.id,
            name: t.name,
            description: t.description,
            pricePerNight: t.basePrice,
            capacity: t.maxGuests,
            bedCount: 1,
            size: null,
            amenities: t.amenities,
            images: t.images,
            featured: false,
            available: t.isActive,
            rooms: t.rooms,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        },
    });
});

// Customer-facing: availability check for a room type
// Request body: { roomTypeId, checkIn, checkOut }
// Response shape matches web expectations: { available, availableRooms, totalPrice }
app.post('/api/rooms/availability', async (req, res) => {
    const { roomTypeId, checkIn, checkOut } = req.body ?? {};

    if (typeof roomTypeId !== 'string' || typeof checkIn !== 'string' || typeof checkOut !== 'string') {
        return res.status(400).json({ error: 'roomTypeId, checkIn, checkOut are required' });
    }

    const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId },
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });

    if (!roomType) {
        return res.status(404).json({ error: 'Room type not found' });
    }

    // NOTE: booking-service has the authoritative availability check.
    // For now, we return "available" based on having any AVAILABLE rooms.
    // We'll tighten this by calling booking-service check-availability per room if/when needed.
    const availableRooms = roomType.rooms;
    const available = availableRooms.length > 0;

    // Basic pricing: basePrice * nights
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = roomType.basePrice * nights;

    return res.json({ available, availableRooms, totalPrice });
});

app.listen(PORT, () => {
    console.log(`Room service running on port ${PORT}`);

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'roomService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
