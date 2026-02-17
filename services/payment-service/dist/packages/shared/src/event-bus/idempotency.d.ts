type PrismaWithProcessedEvent = {
    processedEvent: {
        create: (args: {
            data: {
                consumer: string;
                messageId: string;
                eventType: string | null;
                routingKey: string | null;
                processedAt: Date;
            };
        }) => Promise<unknown>;
        deleteMany: (args: {
            where: {
                consumer: string;
                messageId: string;
            };
        }) => Promise<unknown>;
    };
};
export declare function withEventIdempotency<T>(prisma: PrismaWithProcessedEvent, params: {
    consumer: string;
    messageId: string;
    eventType?: string;
    routingKey?: string;
}, fn: () => Promise<T>): Promise<{
    skipped: boolean;
    result?: T;
}>;
export {};
//# sourceMappingURL=idempotency.d.ts.map