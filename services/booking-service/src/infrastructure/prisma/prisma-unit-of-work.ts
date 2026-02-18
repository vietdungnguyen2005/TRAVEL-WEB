import prisma from '../../lib/prisma';
import type { UnitOfWork, TransactionContext } from '../../application/ports/unit-of-work';

export const prismaUnitOfWork: UnitOfWork = {
    async transaction<T>(fn: (tx: TransactionContext) => Promise<T>) {
        return prisma.$transaction(async (tx) => fn(tx as unknown as TransactionContext));
    },
};
