import amqp, { ConsumeMessage, Options } from 'amqplib';
export type RabbitMqConfig = {
    url: string;
    exchange: string;
};
export type RabbitTopology = {
    exchange: {
        name: string;
        type?: 'topic' | 'direct' | 'fanout' | 'headers';
        options?: Options.AssertExchange;
    };
    dlx?: {
        exchange: {
            name: string;
            type?: 'topic' | 'direct' | 'fanout' | 'headers';
            options?: Options.AssertExchange;
        };
    };
    queues: Array<{
        name: string;
        options?: Options.AssertQueue;
        bindings: Array<{
            exchange: string;
            routingKey: string;
        }>;
    }>;
    retry?: {
        exchange: {
            name: string;
            type?: 'topic' | 'direct' | 'fanout' | 'headers';
            options?: Options.AssertExchange;
        };
        queues: Array<{
            name: string;
            ttlMs: number;
            deadLetterExchange: string;
            deadLetterRoutingKey: string;
            bindings: Array<{
                exchange: string;
                routingKey: string;
            }>;
            options?: Options.AssertQueue;
        }>;
    };
};
export type PublishOptions = {
    routingKey: string;
    message: unknown;
    options?: Options.Publish;
};
export type RpcRequestOptions = {
    routingKey: string;
    message: unknown;
    timeoutMs?: number;
    options?: Options.Publish;
};
export type ConsumeOptions = {
    queue: string;
    bindingKeys: string[];
    prefetch?: number;
    consumerTag?: string;
    enableDlq?: boolean;
    deadLetterExchange?: string;
    deadLetterQueue?: string;
    deadLetterRoutingKey?: string;
};
export type ConsumeWithRetryOptions = ConsumeOptions & {
    maxRetries?: number;
    retryDelaysMs?: number[];
    retryExchange?: string;
    enableRetry?: boolean;
    onRetryScheduled?: (info: {
        queue: string;
        routingKey: string;
        messageId?: string;
        correlationId?: string;
        currentRetry: number;
        nextRetry: number;
        delayMs: number;
    }) => void;
};
export type ConsumeHandler = (payload: unknown, raw: ConsumeMessage) => Promise<void> | void;
export declare function rabbitConnect(config?: Partial<RabbitMqConfig>): Promise<{
    connection: amqp.ChannelModel;
    channel: amqp.Channel;
    url: string;
    exchange: string;
}>;
export declare function rabbitAssertTopology(topology: RabbitTopology): Promise<void>;
export declare function rabbitPublish({ routingKey, message, options }: PublishOptions): Promise<void>;
export declare function rabbitRpc<TResponse = unknown>({ routingKey, message, timeoutMs, options }: RpcRequestOptions): Promise<TResponse>;
export declare function rabbitConsume(opts: ConsumeOptions, handler: ConsumeHandler): Promise<void>;
export declare function rabbitConsumeWithRetry(opts: ConsumeWithRetryOptions, handler: ConsumeHandler): Promise<void>;
//# sourceMappingURL=rabbitmq.d.ts.map