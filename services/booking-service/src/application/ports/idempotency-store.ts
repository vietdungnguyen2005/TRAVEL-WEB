export type IdempotencyKey = {
    consumer: string;
    messageId: string;
    eventType: string;
    routingKey: string;
};

export type IdempotencyStore = {
    runOnce<T>(key: IdempotencyKey, fn: () => Promise<T>): Promise<{ skipped: boolean; result?: T }>;
};
