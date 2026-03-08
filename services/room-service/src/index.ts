import express from 'express';
import { consulRegisterService, createCorrelationIdMiddleware } from '@travel-web/shared';
import path from 'path';
import { createRequire } from 'module';
import type { Prisma as PrismaTypes, RoomStatus as RoomStatusType } from '../node_modules/.prisma/room-client';
import { requireRole, verifyJWT } from '@travel-web/shared';
import { config as loadEnv } from 'dotenv';

type RoomPrismaClientModule = {
    PrismaClient: typeof import('../node_modules/.prisma/room-client').PrismaClient;
};

const requireFromHere = createRequire(__filename);
const generatedClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'room-client');
const { PrismaClient } = requireFromHere(generatedClientPath) as RoomPrismaClientModule;

// Load env vars from services/room-service/.env when running locally.
loadEnv();

const app = express();
const PORT = process.env.PORT || 3003;

const prisma = new PrismaClient();

app.use(createCorrelationIdMiddleware());
app.use(express.json());

app.get('/health', (req, res) => res.send('Room service healthy'));

// Admin endpoints (mounted under /api/admin/* by API Gateway)
const admin = express.Router();
admin.use(verifyJWT, requireRole('ADMIN'));

// Room Types
admin.get('/room-types', async (_req, res) => {
    const types = await prisma.roomType.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(
        types.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            pricePerNight: t.basePrice,
            maxGuests: t.maxGuests,
            location: t.location,
            amenities: t.amenities,
            images: t.images,
            isActive: t.isActive,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }))
    );
});

admin.post('/room-types', async (req, res) => {
    const { name, description, pricePerNight, maxGuests, location, amenities, images, isActive } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'name is required' });

    try {
        const created = await prisma.roomType.create({
            data: {
                name: String(name),
                description: description ? String(description) : '',
                basePrice: typeof pricePerNight === 'number' ? pricePerNight : Number(pricePerNight ?? 0),
                maxGuests: typeof maxGuests === 'number' ? maxGuests : Number(maxGuests ?? 2),
                location: typeof location === 'string' ? location : 'Hà Nội',
                amenities: Array.isArray(amenities) ? amenities : [],
                images: Array.isArray(images) ? images : [],
                isActive: typeof isActive === 'boolean' ? isActive : true,
            },
        });

        return res.status(201).json({
            id: created.id,
            name: created.name,
            description: created.description,
            pricePerNight: created.basePrice,
            maxGuests: created.maxGuests,
            location: created.location,
            amenities: created.amenities,
            images: created.images,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot create room type';
        return res.status(400).json({ error: message });
    }
});

admin.patch('/room-types/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, pricePerNight, maxGuests, location, amenities, images, isActive } = req.body ?? {};

    try {
        const updated = await prisma.roomType.update({
            where: { id },
            data: {
                name: typeof name === 'string' ? name : undefined,
                description: typeof description === 'string' ? description : undefined,
                basePrice: typeof pricePerNight === 'number' ? pricePerNight : undefined,
                maxGuests: typeof maxGuests === 'number' ? maxGuests : undefined,
                location: typeof location === 'string' ? location : undefined,
                amenities: Array.isArray(amenities) ? amenities : undefined,
                images: Array.isArray(images) ? images : undefined,
                isActive: typeof isActive === 'boolean' ? isActive : undefined,
            },
        });

        return res.json({
            id: updated.id,
            name: updated.name,
            description: updated.description,
            pricePerNight: updated.basePrice,
            maxGuests: updated.maxGuests,
            location: updated.location,
            amenities: updated.amenities,
            images: updated.images,
            isActive: updated.isActive,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot update room type';
        return res.status(400).json({ error: message });
    }
});

admin.delete('/room-types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.roomType.delete({ where: { id } });
        return res.status(204).send();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot delete room type';
        return res.status(400).json({ error: message });
    }
});

// Rooms
admin.get('/rooms', async (_req, res) => {
    const rooms = await prisma.room.findMany({
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        include: { roomType: true },
    });

    res.json(
        rooms.map((r) => ({
            id: r.id,
            roomNumber: r.roomNumber,
            floor: r.floor ?? 1,
            status: r.status,
            roomTypeId: r.roomTypeId,
            roomType: {
                name: r.roomType.name,
                pricePerNight: r.roomType.basePrice,
            },
        }))
    );
});

admin.post('/rooms', async (req, res) => {
    const { roomNumber, floor, status, roomTypeId } = req.body ?? {};
    if (!roomNumber || !roomTypeId) return res.status(400).json({ error: 'roomNumber and roomTypeId are required' });

    try {
        const created = await prisma.room.create({
            data: {
                roomNumber: String(roomNumber),
                floor: typeof floor === 'number' ? floor : Number(floor ?? 1),
                status: (status ?? 'AVAILABLE') as RoomStatusType,
                roomTypeId: String(roomTypeId),
            },
            include: { roomType: true },
        });

        return res.status(201).json({
            id: created.id,
            roomNumber: created.roomNumber,
            floor: created.floor ?? 1,
            status: created.status,
            roomTypeId: created.roomTypeId,
            roomType: { name: created.roomType.name, pricePerNight: created.roomType.basePrice },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot create room';
        return res.status(400).json({ error: message });
    }
});

admin.patch('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    const { roomNumber, floor, status, roomTypeId } = req.body ?? {};

    try {
        const updated = await prisma.room.update({
            where: { id },
            data: {
                roomNumber: typeof roomNumber === 'string' ? roomNumber : undefined,
                floor: typeof floor === 'number' ? floor : floor != null ? Number(floor) : undefined,
                status: typeof status === 'string' ? (status as RoomStatusType) : undefined,
                roomTypeId: typeof roomTypeId === 'string' ? roomTypeId : undefined,
            },
            include: { roomType: true },
        });

        return res.json({
            id: updated.id,
            roomNumber: updated.roomNumber,
            floor: updated.floor ?? 1,
            status: updated.status,
            roomTypeId: updated.roomTypeId,
            roomType: { name: updated.roomType.name, pricePerNight: updated.roomType.basePrice },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot update room';
        return res.status(400).json({ error: message });
    }
});

admin.delete('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.room.delete({ where: { id } });
        return res.status(204).send();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cannot delete room';
        return res.status(400).json({ error: message });
    }
});

app.use('/api/admin', admin);

// Customer-facing: list room types (what the web calls "rooms")
// Query params supported by the web UI:
// - minPrice, maxPrice, capacity, roomTypes (comma-separated by name), location, sortBy
app.get('/api/rooms', async (req, res) => {
    const minPrice = typeof req.query.minPrice === 'string' ? Number(req.query.minPrice) : undefined;
    const maxPrice = typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : undefined;
    const capacity = typeof req.query.capacity === 'string' ? Number(req.query.capacity) : undefined;
    const roomTypes = typeof req.query.roomTypes === 'string' ? req.query.roomTypes : undefined;
    const location = typeof req.query.location === 'string' ? req.query.location : undefined;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'price-asc';

    const where: PrismaTypes.RoomTypeWhereInput = { isActive: true };

    // basePrice filtering
    if (!Number.isNaN(minPrice as number) || !Number.isNaN(maxPrice as number)) {
        const basePrice: PrismaTypes.IntFilter = {};
        if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) basePrice.gte = minPrice;
        if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) basePrice.lte = maxPrice;
        where.basePrice = basePrice;
    }

    // capacity -> maxGuests
    if (typeof capacity === 'number' && !Number.isNaN(capacity)) {
        where.maxGuests = capacity >= 4 ? { gte: 4 } : capacity;
    }

    // filter by names
    if (roomTypes) {
        where.name = { in: roomTypes.split(',').map((s) => s.trim()).filter(Boolean) };
    }

    // filter by location
    if (location) {
        where.location = location;
    }

    let orderBy: PrismaTypes.RoomTypeOrderByWithRelationInput = { basePrice: 'asc' };
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
    // Mark room types with available rooms and basePrice >= 2000000 as "featured"
    const data = types.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        pricePerNight: t.basePrice,
        capacity: t.maxGuests,
        location: t.location,
        bedCount: 1,
        size: null,
        amenities: t.amenities,
        images: t.images,
        featured: t.rooms.length > 0 && t.basePrice >= 2000000,
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
            location: t.location,
            bedCount: 1,
            size: null,
            amenities: t.amenities,
            images: t.images,
            featured: t.rooms.length > 0 && t.basePrice >= 2000000,
            available: t.isActive,
            rooms: t.rooms,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        },
    });
});

// Lookup physical rooms by IDs (used by frontend to enrich booking data)
app.post('/api/rooms/by-ids', async (req, res) => {
    const { ids } = req.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.json({ data: [] });
    }
    const rooms = await prisma.room.findMany({
        where: { id: { in: ids } },
        include: { roomType: true },
    });
    res.json({
        data: rooms.map((r) => ({
            id: r.id,
            roomNumber: r.roomNumber,
            roomType: {
                id: r.roomType.id,
                name: r.roomType.name,
                images: r.roomType.images ?? [],
                description: r.roomType.description ?? '',
            },
        })),
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
