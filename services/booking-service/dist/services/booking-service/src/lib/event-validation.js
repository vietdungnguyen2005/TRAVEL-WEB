"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentCompleted = exports.paymentCompletedSchema = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default({ allErrors: true, strict: false });
exports.paymentCompletedSchema = {
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
};
exports.validatePaymentCompleted = ajv.compile(exports.paymentCompletedSchema);
//# sourceMappingURL=event-validation.js.map