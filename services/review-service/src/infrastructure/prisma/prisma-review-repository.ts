import prisma from '../../lib/prisma';
import type { ReviewRepository, CreateReviewInput, UpdateReviewInput } from '../../application/ports/review-repository';
import type { Review } from '../../domain/review';

function mapReview(row: Record<string, unknown>): Review {
    return {
        id: String(row.id),
        userId: String(row.userId),
        bookingId: String(row.bookingId),
        roomTypeId: String(row.roomTypeId),
        rating: Number(row.rating),
        comment: (row.comment as string) ?? null,
        images: (row.images as string[]) ?? [],
        isVerified: Boolean(row.isVerified),
        createdAt: row.createdAt as Date,
        updatedAt: row.updatedAt as Date,
    };
}

export function createPrismaReviewRepository(): ReviewRepository {
    return {
        async findById(id: string) {
            const row = await prisma.review.findUnique({ where: { id } });
            return row ? mapReview(row as unknown as Record<string, unknown>) : null;
        },

        async findByUserAndBooking(userId: string, bookingId: string) {
            const row = await prisma.review.findUnique({
                where: { userId_bookingId: { userId, bookingId } },
            });
            return row ? mapReview(row as unknown as Record<string, unknown>) : null;
        },

        async findManyByRoomTypeId(roomTypeId: string) {
            const rows = await prisma.review.findMany({
                where: { roomTypeId },
                orderBy: { createdAt: 'desc' },
            });
            return rows.map((r) => mapReview(r as unknown as Record<string, unknown>));
        },

        async findManyByUserId(userId: string) {
            const rows = await prisma.review.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            return rows.map((r) => mapReview(r as unknown as Record<string, unknown>));
        },

        async findAll() {
            const rows = await prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return rows.map((r) => mapReview(r as unknown as Record<string, unknown>));
        },

        async create(input: CreateReviewInput) {
            const row = await prisma.review.create({
                data: {
                    userId: input.userId,
                    bookingId: input.bookingId,
                    roomTypeId: input.roomTypeId,
                    rating: input.rating,
                    comment: input.comment,
                    images: input.images,
                },
            });
            return mapReview(row as unknown as Record<string, unknown>);
        },

        async update(id: string, input: UpdateReviewInput) {
            const data: Record<string, unknown> = {};
            if (input.rating !== undefined) data.rating = input.rating;
            if (input.comment !== undefined) data.comment = input.comment;
            if (input.images !== undefined) data.images = input.images;

            const row = await prisma.review.update({ where: { id }, data });
            return mapReview(row as unknown as Record<string, unknown>);
        },

        async delete(id: string) {
            await prisma.review.delete({ where: { id } });
        },

        async verify(id: string) {
            const row = await prisma.review.update({
                where: { id },
                data: { isVerified: true },
            });
            return mapReview(row as unknown as Record<string, unknown>);
        },
    };
}
