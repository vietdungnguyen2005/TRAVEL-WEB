export declare const paymentCompletedSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["id", "type", "source", "occurredAt", "version", "data"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
        };
        readonly type: {
            readonly const: "PaymentCompleted";
        };
        readonly source: {
            readonly type: "string";
        };
        readonly occurredAt: {
            readonly type: "string";
        };
        readonly version: {
            readonly type: "number";
        };
        readonly correlationId: {
            readonly type: "string";
            readonly nullable: true;
        };
        readonly causationId: {
            readonly type: "string";
            readonly nullable: true;
        };
        readonly data: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["bookingId", "userId"];
            readonly properties: {
                readonly bookingId: {
                    readonly type: "string";
                };
                readonly userId: {
                    readonly type: "string";
                };
            };
        };
    };
};
export declare const validatePaymentCompleted: import("ajv").ValidateFunction<{
    type: any;
    id: any;
    data: any;
    source: any;
    occurredAt: any;
    version: any;
} & {
    type: any;
} & {
    id: any;
} & {
    data: any;
} & {
    source: any;
} & {
    occurredAt: any;
} & {
    version: any;
}>;
//# sourceMappingURL=event-validation.d.ts.map