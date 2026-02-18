import { withEventIdempotency } from '@travel-web/shared';
import prisma from '../../lib/prisma';
import type { EventIdempotencyStore } from '../../application/ports/event-idempotency-store';

export function createPrismaEventIdempotencyStore(): EventIdempotencyStore {
    return {
        runOnce(key, fn) {
            return withEventIdempotency(
                prisma as unknown as Parameters<typeof withEventIdempotency>[0],
                key,
                fn,
            );
        },
    };
}
