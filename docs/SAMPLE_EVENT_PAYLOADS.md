# Sample Event Payloads (RabbitMQ)

All services publish/consume JSON messages via RabbitMQ topic exchange `events`.

## Conventions

- **routingKey**: topic key (e.g. `booking.created`, `payment.completed`)
- **messageId**: stable unique id for idempotency (outbox id / deterministic id)
- **correlationId**: trace id across the whole flow (we use `bookingId`)
- **causationId**: id of the event that triggered this event (when available)

Envelope type used across services: `EventMessage` in `@travel-web/contracts`.

## booking.created

- routingKey: `booking.created`
- producer: booking-service outbox publisher

```json
{
  "id": "7d2b9a2b-7c4d-4b7d-9f52-1c7f11d5f0cc",
  "type": "BookingCreated",
  "source": "booking-service",
  "occurredAt": "2026-02-18T10:00:00.000Z",
  "version": 1,
  "correlationId": "booking_123",
  "data": {
    "bookingId": "booking_123",
    "userId": "user_456",
    "roomId": "room_789",
    "checkIn": "2026-03-01T00:00:00.000Z",
    "checkOut": "2026-03-03T00:00:00.000Z",
    "totalPrice": 1200000,
    "status": "PENDING"
  }
}
```

## payment.completed

- routingKey: `payment.completed`
- producer: payment-service

```json
{
  "id": "payment.completed:booking_123:pay_abc",
  "type": "PaymentCompleted",
  "source": "payment-service",
  "occurredAt": "2026-02-18T10:00:20.000Z",
  "version": 1,
  "correlationId": "booking_123",
  "data": {
    "bookingId": "booking_123",
    "userId": "user_456",
    "paymentMethod": "CARD",
    "status": "COMPLETED"
  }
}
```

## booking.cancelled

- routingKey: `booking.cancelled`
- producer: booking-service outbox publisher

```json
{
  "id": "outbox_987",
  "type": "BookingCancelled",
  "source": "booking-service",
  "occurredAt": "2026-02-18T10:05:00.000Z",
  "version": 1,
  "correlationId": "booking_123",
  "data": {
    "bookingId": "booking_123",
    "userId": "user_456",
    "roomId": "room_789",
    "status": "CANCELLED",
    "paymentStatus": "PAID"
  }
}
```

## payment.paymentrefunded (legacy routing key kept)

- routingKey: `payment.paymentrefunded`
- producer: payment-service
- note: kept for backward compatibility

```json
{
  "id": "payment.refund.completed:booking_123",
  "type": "PaymentRefunded",
  "source": "payment-service",
  "occurredAt": "2026-02-18T10:05:10.000Z",
  "version": 1,
  "correlationId": "booking_123",
  "causationId": "outbox_987",
  "data": {
    "bookingId": "booking_123",
    "stripeRefundId": "re_123"
  }
}
```

## payment.refund.failed

- routingKey: `payment.refund.failed`
- producer: payment-service

```json
{
  "id": "payment.refund.failed:booking_123",
  "type": "PaymentRefundFailed",
  "source": "payment-service",
  "occurredAt": "2026-02-18T10:05:10.000Z",
  "version": 1,
  "correlationId": "booking_123",
  "causationId": "outbox_987",
  "data": {
    "bookingId": "booking_123",
    "reason": "No stripePaymentIntentId found on payment record"
  }
}
```
