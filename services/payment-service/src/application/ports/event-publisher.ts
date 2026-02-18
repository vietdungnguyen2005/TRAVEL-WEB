export type PublishOptions = {
    messageId?: string;
    correlationId?: string;
    headers?: Record<string, unknown>;
};

export type EventPublisher = {
    publish(routingKey: string, message: unknown, options?: PublishOptions): Promise<void>;
};
