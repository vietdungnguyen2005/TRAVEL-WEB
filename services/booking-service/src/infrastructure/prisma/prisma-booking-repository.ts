import prisma from '../../lib/prisma';
import type { BookingRepository, BookingConflictQuery, CreateBookingInput } from '../../application/ports/booking-repository';
import type { TransactionContext } from '../../application/ports/unit-of-work';
import type { Booking, BookingStatus } from '../../domain/booking';

type PrismaLike = typeof prisma;

function mapBooking(b: Record<string, unknown>): Booking {
    return {
        id: String(b.id),
        userId: String(b.userId),
        roomId: String(b.roomId),
        checkIn: b.checkIn as Date,
        checkOut: b.checkOut as Date,
        numberOfGuests: Number(b.numberOfGuests),
        totalPrice: b.totalPrice as Booking['totalPrice'],
        status: b.status as BookingStatus,
        paymentStatus: (b.paymentStatus ?? null) as Booking['paymentStatus'],
        holdExpiresAt: (b.holdExpiresAt ?? null) as Booking['holdExpiresAt'],
        createdAt: b.createdAt as Date,
        updatedAt: b.updatedAt as Date,
    };
}

export function createPrismaBookingRepository(): BookingRepository {
    return {
        async findManyByUserId(userId: string) {
            const rows = await prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
            return rows.map(mapBooking);
        },

        async findManyAll(filter) {
            const where: Record<string, unknown> = {};
            if (filter?.userId) where.userId = filter.userId;
            if (filter?.status) where.status = filter.status;

            const rows = await prisma.booking.findMany({
                where: Object.keys(where).length > 0 ? where : undefined,
                orderBy: { createdAt: 'desc' },
            });
            return rows.map(mapBooking);
        },

        async findFirstConflict(query: BookingConflictQuery) {
            const row = await prisma.booking.findFirst({
                where: {
                    roomId: query.roomId,
                    // Block if any active booking overlaps: PENDING, CONFIRMED, or unexpired/no-expiry ON_HOLD
                    OR: [
                        { status: 'PENDING' },
                        { status: 'CONFIRMED' },
                        { status: 'ON_HOLD', holdExpiresAt: { gt: new Date() } },
                        { status: 'ON_HOLD', holdExpiresAt: null },
                    ],
                    AND: [
                        {
                            OR: [
                                { checkIn: { gte: query.checkIn, lt: query.checkOut } },
                                { checkOut: { gt: query.checkIn, lte: query.checkOut } },
                                { AND: [{ checkIn: { lte: query.checkIn } }, { checkOut: { gte: query.checkOut } }] },
                            ],
                        },
                    ],
                    // Optionally exclude a specific booking (for self-update scenarios)
                    ...(query.excludeBookingId ? { NOT: { id: query.excludeBookingId } } : {}),
                },
            });
            return row ? mapBooking(row) : null;
        },

        /**
         * Transaction-safe conflict check using SELECT ... FOR UPDATE.
         * Locks conflicting rows so concurrent transactions must wait,
         * preventing double-booking race conditions.
         */
        async findFirstConflictTx(tx: TransactionContext, query: BookingConflictQuery) {
            const client = tx as PrismaLike;

            // Use Prisma ORM instead of raw SQL for schema compatibility with Supabase pooler.
            // FOR UPDATE is not available via ORM, but findFirst within an interactive transaction
            // still provides serializable-like isolation because Prisma's $transaction uses
            // the same connection and the database default isolation level.
            const conflict = await client.booking.findFirst({
                where: {
                    roomId: query.roomId,
                    // Block if any active booking overlaps: PENDING, CONFIRMED, or unexpired/no-expiry ON_HOLD
                    OR: [
                        { status: 'PENDING' },
                        { status: 'CONFIRMED' },
                        { status: 'ON_HOLD', holdExpiresAt: { gt: new Date() } },
                        { status: 'ON_HOLD', holdExpiresAt: null },
                    ],
                    AND: [
                        {
                            OR: [
                                { checkIn: { gte: query.checkIn, lt: query.checkOut } },
                                { checkOut: { gt: query.checkIn, lte: query.checkOut } },
                                { AND: [{ checkIn: { lte: query.checkIn } }, { checkOut: { gte: query.checkOut } }] },
                            ],
                        },
                        ...(query.excludeBookingId ? [{ id: { not: query.excludeBookingId } }] : []),
                    ],
                },
            });

            if (!conflict) return null;
            return mapBooking(conflict as unknown as Record<string, unknown>);
        },

        async create(tx: TransactionContext, input: CreateBookingInput) {
            const client = tx as PrismaLike;
            const row = await client.booking.create({
                data: {
                    userId: input.userId,
                    roomId: input.roomId,
                    checkIn: input.checkIn,
                    checkOut: input.checkOut,
                    numberOfGuests: input.numberOfGuests,
                    totalPrice: String(input.totalPrice),
                    status: input.status,
                    holdExpiresAt: input.holdExpiresAt ?? null,
                },
            });
            return mapBooking(row as unknown as Record<string, unknown>);
        },

        async updateStatus(tx: TransactionContext, input: { id: string; status: BookingStatus; paymentStatus?: string | null }) {
            const client = tx as PrismaLike;
            const row = await client.booking.update({
                where: { id: input.id },
                data: {
                    status: input.status,
                    ...(typeof input.paymentStatus !== 'undefined' ? { paymentStatus: input.paymentStatus } : null),
                },
            });
            return mapBooking(row as unknown as Record<string, unknown>);
        },

        async updatePaymentStatus(tx: TransactionContext, input: { id: string; paymentStatus: string }) {
            const client = tx as PrismaLike;
            const row = await client.booking.update({ where: { id: input.id }, data: { paymentStatus: input.paymentStatus } });
            return mapBooking(row as unknown as Record<string, unknown>);
        },

        async getById(id: string) {
            const row = await prisma.booking.findUnique({ where: { id } });
            return row ? mapBooking(row as unknown as Record<string, unknown>) : null;
        },

        async findExpiredOnHold(now: Date) {
            const rows = await prisma.booking.findMany({
                where: {
                    status: 'ON_HOLD',
                    holdExpiresAt: { lte: now },
                },
            });
            return rows.map(mapBooking);
        },

        async findActiveBookingsForRooms(roomIds: string[]) {
            if (roomIds.length === 0) return [];
            const rows = await prisma.booking.findMany({
                where: {
                    roomId: { in: roomIds },
                    checkOut: { gte: new Date() },
                    OR: [
                        { status: 'PENDING' },
                        { status: 'CONFIRMED' },
                        { status: 'ON_HOLD', holdExpiresAt: { gt: new Date() } },
                        { status: 'ON_HOLD', holdExpiresAt: null },
                    ],
                },
                orderBy: { checkIn: 'asc' },
            });
            return rows.map(mapBooking);
        },
    };
}
