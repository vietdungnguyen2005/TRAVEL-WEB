import prisma from '../../lib/prisma';
import type { BookingRepository, BookingConflictQuery, CreateBookingInput } from '../../application/ports/booking-repository';
import type { TransactionContext } from '../../application/ports/unit-of-work';
import type { Booking, BookingStatus } from '../../domain/booking';

type PrismaLike = typeof prisma;

function mapBooking(b: any): Booking {
    return {
        id: b.id,
        userId: b.userId,
        roomId: b.roomId,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        numberOfGuests: b.numberOfGuests,
        totalPrice: b.totalPrice,
        status: b.status as BookingStatus,
        paymentStatus: b.paymentStatus ?? null,
        holdExpiresAt: b.holdExpiresAt ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

export function createPrismaBookingRepository(): BookingRepository {
    return {
        async findManyByUserId(userId: string) {
            const rows = await prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
            return rows.map(mapBooking);
        },

        async findManyAll(filter) {
            const where: any = {};
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
                    status: { in: ['CONFIRMED', 'ON_HOLD'] },
                    OR: [
                        { checkIn: { gte: query.checkIn, lt: query.checkOut } },
                        { checkOut: { gt: query.checkIn, lte: query.checkOut } },
                        { AND: [{ checkIn: { lte: query.checkIn } }, { checkOut: { gte: query.checkOut } }] },
                    ],
                },
            });
            return row ? mapBooking(row) : null;
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
                    totalPrice: input.totalPrice as any,
                    status: input.status,
                    holdExpiresAt: input.holdExpiresAt ?? null,
                },
            });
            return mapBooking(row);
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
            return mapBooking(row);
        },

        async updatePaymentStatus(tx: TransactionContext, input: { id: string; paymentStatus: string }) {
            const client = tx as PrismaLike;
            const row = await client.booking.update({ where: { id: input.id }, data: { paymentStatus: input.paymentStatus } });
            return mapBooking(row);
        },

        async getById(id: string) {
            const row = await prisma.booking.findUnique({ where: { id } });
            return row ? mapBooking(row) : null;
        },
    };
}
