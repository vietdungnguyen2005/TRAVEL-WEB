import prisma from '../../lib/prisma';
import type { OutboxRepository } from '../../application/ports/outbox-repository';
import type { TransactionContext } from '../../application/ports/unit-of-work';
import type { Prisma } from '../../../node_modules/.prisma/booking-client';

type PrismaLike = typeof prisma;

export function createPrismaOutboxRepository(): OutboxRepository {
    return {
        async create(tx: TransactionContext, input) {
            const client = tx as PrismaLike;
            await client.outbox.create({
                data: {
                    id: input.id,
                    aggregateType: input.aggregateType,
                    aggregateId: input.aggregateId,
                    eventType: input.eventType,
                    payload: input.payload as Prisma.InputJsonValue,
                },
            });
        },
    };
}
