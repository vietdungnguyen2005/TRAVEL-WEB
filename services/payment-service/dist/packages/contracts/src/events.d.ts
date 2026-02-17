export type EventMessage<TType extends string = string, TData = unknown> = {
    /** Unique id for the event (use Outbox.id / UUID). */
    id: string;
    /** Event type, e.g. BookingCreated, PaymentCompleted. */
    type: TType;
    /** Producer service, e.g. booking-service. */
    source: string;
    /** ISO timestamp. */
    occurredAt: string;
    /** Semantic version for schema evolution. */
    version: number;
    /** Correlation id for tracing a business flow (e.g., bookingId). */
    correlationId?: string;
    /** Optional causation id (messageId of the triggering event). */
    causationId?: string;
    /** Event payload. */
    data: TData;
};
//# sourceMappingURL=events.d.ts.map