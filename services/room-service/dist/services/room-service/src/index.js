"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const path_1 = __importDefault(require("path"));
const module_1 = require("module");
const shared_2 = require("@travel-web/shared");
const dotenv_1 = require("dotenv");
const requireFromHere = (0, module_1.createRequire)(__filename);
const generatedClientPath = path_1.default.join(process.cwd(), 'node_modules', '.prisma', 'room-client');
const { PrismaClient } = requireFromHere(generatedClientPath);
// Load env vars from services/room-service/.env when running locally.
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
const prisma = new PrismaClient();
app.use((0, shared_1.createCorrelationIdMiddleware)());
app.use(express_1.default.json());
app.get('/health', (req, res) => res.send('Room service healthy'));
// Admin endpoints (mounted under /api/admin/* by API Gateway)
const admin = express_1.default.Router();
admin.use(shared_2.verifyJWT, (0, shared_2.requireRole)('ADMIN'));
// Room Types
admin.get('/room-types', async (_req, res) => {
    const types = await prisma.roomType.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(types.map((t) => ({
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
    })));
});
admin.post('/room-types', async (req, res) => {
    const { name, description, pricePerNight, maxGuests, location, amenities, images, isActive } = req.body ?? {};
    if (!name)
        return res.status(400).json({ error: 'name is required' });
    const price = typeof pricePerNight === 'number' ? pricePerNight : Number(pricePerNight ?? 0);
    if (!price || price <= 0)
        return res.status(400).json({ error: 'pricePerNight must be a positive number' });
    const guests = typeof maxGuests === 'number' ? maxGuests : Number(maxGuests ?? 2);
    if (guests < 1)
        return res.status(400).json({ error: 'maxGuests must be at least 1' });
    // Check duplicate name
    const existing = await prisma.roomType.findFirst({ where: { name: String(name) } });
    if (existing)
        return res.status(409).json({ error: 'Room type with this name already exists' });
    try {
        const created = await prisma.roomType.create({
            data: {
                name: String(name),
                description: description ? String(description) : '',
                basePrice: price,
                maxGuests: guests,
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot create room type';
        // Hide internal Prisma error details
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot create room type' : message;
        return res.status(400).json({ error: safeMessage });
    }
});
admin.patch('/room-types/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, pricePerNight, maxGuests, location, amenities, images, isActive } = req.body ?? {};
    // Validate pricePerNight if provided
    if (pricePerNight !== undefined && (typeof pricePerNight !== 'number' || pricePerNight <= 0)) {
        return res.status(400).json({ error: 'pricePerNight must be a positive number' });
    }
    // Validate maxGuests if provided
    if (maxGuests !== undefined && (typeof maxGuests !== 'number' || maxGuests < 1)) {
        return res.status(400).json({ error: 'maxGuests must be at least 1' });
    }
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot update room type';
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot update room type' : message;
        return res.status(400).json({ error: safeMessage });
    }
});
admin.delete('/room-types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if room type has associated rooms
        const roomCount = await prisma.room.count({ where: { roomTypeId: id } });
        if (roomCount > 0) {
            return res.status(400).json({
                error: `Cannot delete room type: ${roomCount} room(s) are still using this type. Remove or reassign them first.`,
            });
        }
        await prisma.roomType.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot delete room type';
        if (message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Room type not found' });
        }
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot delete room type' : message;
        return res.status(400).json({ error: safeMessage });
    }
});
// Rooms
admin.get('/rooms', async (_req, res) => {
    const rooms = await prisma.room.findMany({
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        include: { roomType: true },
    });
    res.json(rooms.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        floor: r.floor ?? 1,
        status: r.status,
        roomTypeId: r.roomTypeId,
        roomType: {
            name: r.roomType.name,
            pricePerNight: r.roomType.basePrice,
        },
    })));
});
admin.post('/rooms', async (req, res) => {
    const { roomNumber, floor, status, roomTypeId } = req.body ?? {};
    if (!roomNumber || !roomTypeId)
        return res.status(400).json({ error: 'roomNumber and roomTypeId are required' });
    // Verify room type exists
    const roomType = await prisma.roomType.findUnique({ where: { id: String(roomTypeId) } });
    if (!roomType)
        return res.status(400).json({ error: 'Invalid roomTypeId: room type not found' });
    // Check duplicate roomNumber
    const existingRoom = await prisma.room.findUnique({ where: { roomNumber: String(roomNumber) } });
    if (existingRoom)
        return res.status(409).json({ error: `Room number '${roomNumber}' already exists` });
    try {
        const created = await prisma.room.create({
            data: {
                roomNumber: String(roomNumber),
                floor: typeof floor === 'number' ? floor : Number(floor ?? 1),
                status: (status ?? 'AVAILABLE'),
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot create room';
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot create room' : message;
        return res.status(400).json({ error: safeMessage });
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
                status: typeof status === 'string' ? status : undefined,
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot update room';
        if (message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot update room' : message;
        return res.status(400).json({ error: safeMessage });
    }
});
admin.delete('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the room has active bookings (PENDING, ON_HOLD, CONFIRMED)
        try {
            const activeBookings = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM booking.bookings
                 WHERE "roomId" = $1 AND status IN ('PENDING', 'ON_HOLD', 'CONFIRMED')`, id);
            const count = Number(activeBookings[0]?.count ?? 0);
            if (count > 0) {
                return res.status(400).json({
                    error: `Cannot delete room: ${count} active booking(s) exist. Cancel or complete them first.`,
                });
            }
        }
        catch {
            // If cross-schema query fails, skip booking check (booking schema may not exist)
        }
        await prisma.room.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Cannot delete room';
        if (message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const safeMessage = message.includes('prisma') || message.includes('Prisma') ? 'Cannot delete room' : message;
        return res.status(400).json({ error: safeMessage });
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
    const page = typeof req.query.page === 'string' ? Math.max(1, Number(req.query.page)) : undefined;
    const limit = typeof req.query.limit === 'string' ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;
    // ── Date-based availability filter ──
    const checkInRaw = typeof req.query.checkIn === 'string' ? req.query.checkIn : undefined;
    const checkOutRaw = typeof req.query.checkOut === 'string' ? req.query.checkOut : undefined;
    let checkInDate;
    let checkOutDate;
    if (checkInRaw && checkOutRaw) {
        const ci = new Date(checkInRaw);
        const co = new Date(checkOutRaw);
        if (!isNaN(ci.getTime()) && !isNaN(co.getTime()) && co > ci) {
            checkInDate = ci;
            checkOutDate = co;
        }
    }
    const where = { isActive: true };
    // basePrice filtering
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
        const basePrice = {};
        if (typeof minPrice === 'number' && !Number.isNaN(minPrice))
            basePrice.gte = minPrice;
        if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice))
            basePrice.lte = maxPrice;
        where.basePrice = basePrice;
    }
    // capacity -> maxGuests (always use gte so a search for 3 guests also shows 4/6 guest rooms)
    if (typeof capacity === 'number' && !Number.isNaN(capacity)) {
        where.maxGuests = { gte: capacity };
    }
    // filter by names
    if (roomTypes) {
        where.name = { in: roomTypes.split(',').map((s) => s.trim()).filter(Boolean) };
    }
    // filter by location (case-insensitive, partial match)
    if (location) {
        where.location = { contains: location, mode: 'insensitive' };
    }
    let orderBy = { basePrice: 'asc' };
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
    // When dates are provided, we must filter BEFORE pagination (date filtering is post-query),
    // so fetch all matching types first, then paginate in-memory.
    const hasDates = !!(checkInDate && checkOutDate);
    const usePagination = typeof page === 'number' && !Number.isNaN(page) && typeof limit === 'number' && !Number.isNaN(limit);
    // Count total (without date filter) for non-date pagination
    const totalCount = await prisma.roomType.count({ where });
    const paginationOpts = {};
    if (usePagination && !hasDates) {
        // Only apply DB-level pagination when no date filtering is needed
        paginationOpts.skip = (page - 1) * limit;
        paginationOpts.take = limit;
    }
    const types = await prisma.roomType.findMany({
        where,
        orderBy,
        ...paginationOpts,
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });
    // ── Date-based availability: filter out room types with no available rooms ──
    let filteredTypes = types;
    if (hasDates && types.length > 0) {
        // Collect all physical room IDs across all room types
        const allRoomIds = types.flatMap((t) => t.rooms.map((r) => r.id));
        const conflictSet = new Set();
        if (allRoomIds.length > 0) {
            try {
                const placeholders = allRoomIds.map((_, i) => `$${i + 3}`).join(',');
                const conflictRows = await prisma.$queryRawUnsafe(`SELECT DISTINCT "roomId" FROM booking.bookings
                     WHERE "roomId" IN (${placeholders})
                       AND status IN ('CONFIRMED', 'ON_HOLD')
                       AND "checkIn" < $1 AND "checkOut" > $2`, checkOutDate, checkInDate, ...allRoomIds);
                for (const row of conflictRows) {
                    conflictSet.add(row.roomId);
                }
            }
            catch (err) {
                // If cross-schema query fails, skip date filter gracefully
                console.warn('[room-service] Could not check booking conflicts for listing, falling back to status-only:', err);
            }
        }
        if (conflictSet.size > 0) {
            // For each room type, keep only rooms without conflicts
            filteredTypes = types
                .map((t) => ({
                ...t,
                rooms: t.rooms.filter((r) => !conflictSet.has(r.id)),
            }))
                .filter((t) => t.rooms.length > 0); // Remove room types with zero availability
        }
    }
    // When dates are provided, apply pagination in-memory after date filtering
    const dateFilteredTotal = filteredTypes.length;
    if (usePagination && hasDates) {
        const skip = (page - 1) * limit;
        filteredTypes = filteredTypes.slice(skip, skip + limit);
    }
    // Calculate nights for total price when dates are provided
    const nights = hasDates
        ? Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
        : null;
    // Map room-service schema -> web expects fields like pricePerNight/capacity/bedCount/etc.
    // Mark room types with available rooms and basePrice >= 2000000 as "featured"
    const data = filteredTypes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        basePrice: t.basePrice,
        pricePerNight: t.basePrice,
        totalPrice: nights ? t.basePrice * nights : null,
        nights,
        maxGuests: t.maxGuests,
        capacity: t.maxGuests,
        location: t.location,
        bedCount: 1,
        size: null,
        amenities: t.amenities,
        images: t.images,
        featured: t.rooms.length > 0 && t.basePrice >= 2000000,
        available: t.isActive && t.rooms.length > 0,
        availableCount: t.rooms.length,
        rooms: t.rooms,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    }));
    const responsePayload = { data };
    if (usePagination) {
        const effectiveTotal = hasDates ? dateFilteredTotal : totalCount;
        responsePayload.pagination = {
            page: page,
            limit: limit,
            total: effectiveTotal,
            totalPages: Math.ceil(effectiveTotal / limit),
        };
    }
    res.json(responsePayload);
});
// Customer-facing: room type detail
app.get('/api/rooms/:id', async (req, res) => {
    const { id } = req.params;
    const t = await prisma.roomType.findUnique({
        where: { id },
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });
    if (!t)
        return res.status(404).json({ message: 'Room type not found' });
    res.json({
        data: {
            id: t.id,
            name: t.name,
            description: t.description,
            basePrice: t.basePrice,
            pricePerNight: t.basePrice,
            maxGuests: t.maxGuests,
            capacity: t.maxGuests,
            location: t.location,
            bedCount: 1,
            size: null,
            amenities: t.amenities,
            images: t.images,
            featured: t.rooms.length > 0 && t.basePrice >= 2000000,
            available: t.isActive && t.rooms.length > 0,
            availableCount: t.rooms.length,
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
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
        return res.status(400).json({ error: 'checkIn and checkOut must be valid dates' });
    }
    if (outDate <= inDate) {
        return res.status(400).json({ error: 'checkOut must be after checkIn' });
    }
    // Reject past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inDate < today) {
        return res.status(400).json({ error: 'checkIn must not be in the past' });
    }
    const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId },
        include: { rooms: { where: { status: 'AVAILABLE' } } },
    });
    if (!roomType) {
        return res.status(404).json({ error: 'Room type not found' });
    }
    // Filter out rooms that have conflicting bookings (CONFIRMED or ON_HOLD)
    let availableRooms = roomType.rooms;
    if (availableRooms.length > 0) {
        try {
            const roomIds = availableRooms.map(r => r.id);
            const placeholders = roomIds.map((_, i) => `$${i + 3}`).join(',');
            const conflictRows = await prisma.$queryRawUnsafe(`SELECT DISTINCT "roomId" FROM booking.bookings
                 WHERE "roomId" IN (${placeholders})
                   AND status IN ('CONFIRMED', 'ON_HOLD')
                   AND "checkIn" < $1 AND "checkOut" > $2`, outDate, inDate, ...roomIds);
            const conflictSet = new Set(conflictRows.map(r => r.roomId));
            availableRooms = availableRooms.filter(r => !conflictSet.has(r.id));
        }
        catch (err) {
            // If cross-schema query fails (e.g. booking schema not accessible),
            // fall back to status-only check
            console.warn('[room-service] Could not check booking conflicts, falling back to status-only:', err);
        }
    }
    const available = availableRooms.length > 0;
    // Basic pricing: basePrice * nights
    const nights = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = roomType.basePrice * nights;
    return res.json({ available, availableRooms, totalPrice });
});
// Centralized error handling (catches Prisma errors, AppError, etc.)
app.use((0, shared_1.createErrorHandler)('room-service'));
app.listen(PORT, () => {
    console.log(`Room service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
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
//# sourceMappingURL=index.js.map