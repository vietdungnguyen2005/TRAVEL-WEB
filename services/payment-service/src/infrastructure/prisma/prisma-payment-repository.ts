import prisma from '../../lib/prisma';
import type { PaymentRepository } from '../../application/ports/payment-repository';
import type { Payment, PaymentStatus } from '../../domain/payment';

type PrismaPayment = Awaited<ReturnType<typeof prisma.payment.findFirst>>;

function mapPayment(p: any): Payment {
    return {
        id: p.id,
        bookingId: p.bookingId,
        userId: p.userId,
        amount: p.amount,
        currency: p.currency,
        status: p.status as PaymentStatus,
        stripeCheckoutSessionId: p.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: p.stripePaymentIntentId ?? null,
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

        async upsertCheckoutSession(input) {
            const row = await prisma.payment.upsert({
                where: { bookingId: input.bookingId },
                create: {
                    bookingId: input.bookingId,
                    userId: input.userId,
                    amount: input.amount,
                    currency: input.currency,
                    status: 'PENDING',
                    stripeCheckoutSessionId: input.stripeCheckoutSessionId,
                    metadata: input.metadata as any,
                },
                update: {
                    userId: input.userId,
                    amount: input.amount,
                    currency: input.currency,
                    status: 'PENDING',
                    stripeCheckoutSessionId: input.stripeCheckoutSessionId,
                    metadata: input.metadata as any,
                },
            });
            return mapPayment(row);
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
                    metadata: { source: 'queue-demo', roomId: input.roomId } as any,
                },
                update: {
                    status: 'COMPLETED',
                    metadata: { source: 'queue-demo', roomId: input.roomId } as any,
                },
            });
            return mapPayment(row);
        },

        async markCompletedByBookingId(input) {
            await prisma.payment.updateMany({
                where: { bookingId: input.bookingId },
                data: {
                    status: 'COMPLETED',
                    stripePaymentIntentId: input.stripePaymentIntentId || undefined,
                },
            });
        },

        async updateStatusByBookingId(input) {
            const existing = await prisma.payment.findUnique({ where: { bookingId: input.bookingId } });
            const meta = (typeof existing?.metadata === 'object' && existing?.metadata ? (existing.metadata as Record<string, unknown>) : {});

            await prisma.payment.update({
                where: { bookingId: input.bookingId },
                data: {
                    status: input.status,
                    ...(input.mergeMetadata ? { metadata: { ...meta, ...input.mergeMetadata } as any } : {}),
                },
            });
        },

        async updateRefundMetadataByBookingId(input) {
            const existing = await prisma.payment.findUnique({ where: { bookingId: input.bookingId } });
            const meta = (typeof existing?.metadata === 'object' && existing?.metadata ? (existing.metadata as Record<string, unknown>) : {});

            await prisma.payment.update({
                where: { bookingId: input.bookingId },
                data: {
                    status: input.status,
                    metadata: { ...meta, ...input.mergeMetadata } as any,
                },
            });
        },
    };
}
