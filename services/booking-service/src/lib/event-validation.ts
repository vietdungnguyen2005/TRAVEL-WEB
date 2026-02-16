import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

export const paymentCompletedSchema = {
    type: 'object',
    additionalProperties: true,
    required: ['id', 'type', 'source', 'occurredAt', 'version', 'data'],
    properties: {
        id: { type: 'string' },
        type: { const: 'PaymentCompleted' },
        source: { type: 'string' },
        occurredAt: { type: 'string' },
        version: { type: 'number' },
        correlationId: { type: 'string', nullable: true },
        causationId: { type: 'string', nullable: true },
        data: {
            type: 'object',
            additionalProperties: true,
            required: ['bookingId', 'userId'],
            properties: {
                bookingId: { type: 'string' },
                userId: { type: 'string' },
            },
        },
    },
} as const;

export const validatePaymentCompleted = ajv.compile(paymentCompletedSchema);
