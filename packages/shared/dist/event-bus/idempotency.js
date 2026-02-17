"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withEventIdempotency = withEventIdempotency;
function tryGetErrorCode(err) {
    if (!err || typeof err !== 'object')
        return undefined;
    if (!('code' in err))
        return undefined;
    const code = err.code;
    return typeof code === 'string' ? code : undefined;
}
// Generic, Prisma-based idempotency helper for RabbitMQ consumers.
// Requires a Prisma model named ProcessedEvent with a unique constraint on (consumer, messageId).
async function withEventIdempotency(prisma, params, fn) {
    const { consumer, messageId, eventType, routingKey } = params;
    // Fast path: try insert; if unique violation => already processed.
    try {
        await prisma.processedEvent.create({
            data: {
                consumer,
                messageId,
                eventType: eventType || null,
                routingKey: routingKey || null,
                processedAt: new Date(),
            },
        });
    }
    catch (err) {
        const code = tryGetErrorCode(err);
        if (code === 'P2002') {
            return { skipped: true };
        }
        throw err;
    }
    try {
        const result = await fn();
        return { skipped: false, result };
    }
    catch (err) {
        // If handler fails, remove marker so retry can re-process.
        try {
            await prisma.processedEvent.deleteMany({ where: { consumer, messageId } });
        }
        catch {
            // ignore
        }
        throw err;
    }
}
