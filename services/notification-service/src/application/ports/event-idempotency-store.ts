export type EventIdempotencyKey = {
    consumer: string;
    messageId: string;
    eventType?: string;
    routingKey?: string;
};

export type EventIdempotencyStore = {
    runOnce<T>(key: EventIdempotencyKey, fn: () => Promise<T>): Promise<{ skipped: boolean; result?: T }>;
};
