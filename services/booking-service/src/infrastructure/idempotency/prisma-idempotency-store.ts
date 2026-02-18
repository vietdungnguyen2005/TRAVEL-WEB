import prisma from '../../lib/prisma';
import { withEventIdempotency } from '@travel-web/shared';
import type { IdempotencyKey, IdempotencyStore } from '../../application/ports/idempotency-store';

export const prismaIdempotencyStore: IdempotencyStore = {
    async runOnce<T>(key: IdempotencyKey, fn: () => Promise<T>) {
        return withEventIdempotency(
            prisma as unknown as Parameters<typeof withEventIdempotency>[0],
            key,
            fn,
        );
    },
};
