import prisma, { Prisma } from '../../lib/prisma';
import type { IdempotencyScope, IdempotencyStore } from '../../application/ports/idempotency-store';

function tryGetPrismaErrorCode(err: unknown): string | undefined {
    if (!err || typeof err !== 'object') return undefined;
    if (!('code' in err)) return undefined;
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
}

export function createPrismaIdempotencyStore(): IdempotencyStore {
    return {
        async begin(scope: IdempotencyScope, key: string, bookingId?: string) {
            try {
                await prisma.idempotencyKey.create({
                    data: { scope, key, bookingId: bookingId || null },
                });
                return { ok: true };
            } catch (err) {
                const code = tryGetPrismaErrorCode(err);
                if (code === 'P2002') return { ok: false, conflict: true };
                throw err;
            }
        },

        async getResponse(scope: IdempotencyScope, key: string) {
            const row = await prisma.idempotencyKey.findUnique({
                where: { scope_key: { scope, key } },
            });
            if (!row || !row.response || !row.statusCode) return null;
            return { statusCode: row.statusCode as number, body: row.response as unknown };
        },

        async saveResponse(scope: IdempotencyScope, key: string, statusCode: number, body: unknown) {
            type ResponseInput = Parameters<typeof prisma.idempotencyKey.update>[0]['data']['response'];
            const response: ResponseInput = body === null ? (Prisma.JsonNull as ResponseInput) : (body as ResponseInput);

            await prisma.idempotencyKey.update({
                where: { scope_key: { scope, key } },
                data: { statusCode, response },
            });
        },
    };
}
