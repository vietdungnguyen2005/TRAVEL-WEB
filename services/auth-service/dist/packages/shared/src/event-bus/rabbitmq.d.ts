import amqp, { ConsumeMessage, Options } from 'amqplib';
export type RabbitMqConfig = {
    url: string;
    exchange: string;
};
export type PublishOptions = {
    routingKey: string;
    message: unknown;
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
export type ConsumeHandler = (payload: unknown, raw: ConsumeMessage) => Promise<void> | void;
export declare function rabbitConnect(config?: Partial<RabbitMqConfig>): Promise<{
    connection: amqp.ChannelModel;
    channel: amqp.Channel;
    url: string;
    exchange: string;
}>;
export declare function rabbitPublish({ routingKey, message, options }: PublishOptions): Promise<void>;
export declare function rabbitConsume(opts: ConsumeOptions, handler: ConsumeHandler): Promise<void>;
//# sourceMappingURL=rabbitmq.d.ts.map