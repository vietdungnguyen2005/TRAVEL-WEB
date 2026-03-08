import prisma from '../../lib/prisma';
import type { PaymentRepository } from '../../application/ports/payment-repository';
import type { Payment, PaymentStatus } from '../../domain/payment';
import type { Prisma } from '../../../node_modules/.prisma/payment-client';

type PaymentRow = {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    vnpTxnRef: string | null;
    vnpTransactionNo: string | null;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
};

function mapPayment(p: PaymentRow): Payment {
    return {
        id: p.id,
        bookingId: p.bookingId,
        userId: p.userId,
        amount: p.amount,
        currency: p.currency,
        status: p.status as PaymentStatus,
        vnpTxnRef: p.vnpTxnRef ?? null,
        vnpTransactionNo: p.vnpTransactionNo ?? null,
        metadata: p.metadata,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
}

export function createPrismaPaymentRepository(): PaymentRepository {
    return {
        async findByBookingId(bookingId) {
            const row = await prisma.payment.findUnique({ where: { bookingId } });
            return row ? mapPayment(row) : null;
        },

        async upsertPaymentUrl(input) {
            const row = await prisma.payment.upsert({
                where: { bookingId: input.bookingId },
                create: {
                    bookingId: input.bookingId,
                    userId: input.userId,
                    amount: input.amount,
                    currency: input.currency,
                    status: 'PENDING',
                    vnpTxnRef: input.vnpTxnRef,
                    metadata: input.metadata as Prisma.InputJsonValue,
                },
                update: {
                    userId: input.userId,
                    amount: input.amount,
                    currency: input.currency,
                    status: 'PENDING',
                    vnpTxnRef: input.vnpTxnRef,
                    metadata: input.metadata as Prisma.InputJsonValue,
                },
            });
            return mapPayment(row as PaymentRow);
        },

        async upsertDemoCompleted(input) {
            const row = await prisma.payment.upsert({
                where: { bookingId: input.bookingId },
                create: {
                    bookingId: input.bookingId,
                    userId: input.userId,
                    amount: 0,
                    currency: 'vnd',
                    status: 'COMPLETED',
                    metadata: { source: 'queue-demo', roomId: input.roomId } as Prisma.InputJsonObject,
                },
                update: {
                    status: 'COMPLETED',
                    metadata: { source: 'queue-demo', roomId: input.roomId } as Prisma.InputJsonObject,
                },
            });
            return mapPayment(row as PaymentRow);
        },

        async markCompletedByBookingId(input) {
            await prisma.payment.updateMany({
                where: { bookingId: input.bookingId },
                data: {
                    status: 'COMPLETED',
                    vnpTransactionNo: input.vnpTransactionNo || undefined,
                },
            });
        },

        async updateStatusByBookingId(input) {
            const existing = await prisma.payment.findUnique({ where: { bookingId: input.bookingId } });
            const meta = (typeof existing?.metadata === 'object' && existing?.metadata ? (existing.metadata as Record<string, unknown>) : {});
            const mergedMetadata =
                input.mergeMetadata ? ({ ...meta, ...input.mergeMetadata } as Prisma.InputJsonObject) : undefined;

            await prisma.payment.update({
                where: { bookingId: input.bookingId },
                data: {
                    status: input.status,
                    ...(mergedMetadata ? { metadata: mergedMetadata } : {}),
                },
            });
        },

        async updateRefundMetadataByBookingId(input) {
            const existing = await prisma.payment.findUnique({ where: { bookingId: input.bookingId } });
            const meta = (typeof existing?.metadata === 'object' && existing?.metadata ? (existing.metadata as Record<string, unknown>) : {});
            const mergedMetadata = { ...meta, ...input.mergeMetadata } as Prisma.InputJsonObject;

            await prisma.payment.update({
                where: { bookingId: input.bookingId },
                data: {
                    status: input.status,
                    metadata: mergedMetadata,
                },
            });
        },
    };
}
