import client from 'prom-client';
export declare const register: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const paymentRabbitConsumeTotal: client.Counter<"routingKey" | "queue" | "eventType" | "status">;
export declare const paymentRabbitConsumeDurationSeconds: client.Histogram<"routingKey" | "queue" | "eventType">;
export declare const paymentRabbitPublishTotal: client.Counter<"routingKey" | "status">;
export declare const paymentRabbitPublishDurationSeconds: client.Histogram<"routingKey">;
export default register;
//# sourceMappingURL=metrics.d.ts.map