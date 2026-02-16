# Queue Architecture - Travel Web Microservices

## Executive summary
Travel Web (hotel booking) đang chạy theo mô hình microservices (Node.js + TypeScript) với PostgreSQL cho dữ liệu giao dịch và Redis cho cache/rate-limit. Để tách rời luồng xử lý “đặt phòng → thanh toán → xác nhận → gửi thông báo” khỏi HTTP request, hệ thống cần một message queue để giao tiếp async, đảm bảo **độ bền (durability)**, **at-least-once delivery**, và khả năng **scale ngang** theo tải.

Tài liệu này mô tả kiến trúc queue dựa trên **RabbitMQ (topic exchange)** làm broker chính. Các service sử dụng **Outbox pattern** để publish event một cách transactional, cùng với **DLQ** để cô lập “poison message”, và **Idempotency** (ProcessedEvent) để xử lý an toàn trong mô hình at-least-once.

Bộ mã mẫu trong repo kèm theo có thể chạy local qua [docker-compose.queue.yml](../docker-compose.queue.yml) và có integration test end-to-end. Thiết kế đủ “defendable”: có lý do chọn RabbitMQ, tradeoffs, quy ước routing key, schema validation, bảo mật, observability và checklist production.

---

## Mục lục
1. [Overview](#overview)
2. [So sánh công nghệ & lý do chọn RabbitMQ](#so-sánh-công-nghệ--lý-do-chọn-rabbitmq)
3. [Luồng xử lý (Diagrams)](#luồng-xử-lý-diagrams)
4. [Exchange/Queue design](#exchangequeue-design)
5. [Outbox pattern](#outbox-pattern)
6. [DLQ & Retry/Backoff](#dlq--retrybackoff)
7. [Idempotency](#idempotency)
8. [Request-Response qua queue (RPC)](#request-response-qua-queue-rpc)
9. [Saga pattern (Orchestration)](#saga-pattern-orchestration)
10. [Message schema & validation (Ajv)](#message-schema--validation-ajv)
11. [Security & hardening](#security--hardening)
12. [Durability & delivery semantics](#durability--delivery-semantics)
13. [Scaling & performance](#scaling--performance)
14. [Monitoring & observability](#monitoring--observability)
15. [Testing](#testing)
16. [Troubleshooting](#troubleshooting)
17. [Environment variables](#environment-variables)
18. [Checklist production](#checklist-production)
19. [FAQ + câu hỏi GV hay hỏi](#faq--câu-hỏi-gv-hay-hỏi)
20. [What I would demo (3 bước)](#what-i-would-demo-3-bước)
21. [Gợi ý git commit history](#gợi-ý-git-commit-history)

---

## Overview
**Mục tiêu**
- Tách luồng booking khỏi các tác vụ chậm: thanh toán, gửi email/SMS, analytics.
- Đảm bảo publish event **không mất** (durable) và consumer xử lý **idempotent**.
- Cho phép scale consumer theo tải, quan sát được throughput/latency/DLQ.

**Phạm vi**
- RabbitMQ là broker chính (topic exchange).
- PostgreSQL là DB cho từng service.
- Redis dùng cache/rate-limit (không dùng làm broker chính trong thiết kế này).

**Giả định**
- Các service đang chạy Express + TS (repo hiện tại).
- Prisma dùng per-service schema (ví dụ: [services/booking-service/prisma/schema.prisma](../services/booking-service/prisma/schema.prisma)).

---

## So sánh công nghệ & lý do chọn RabbitMQ
**RabbitMQ**
- Ưu: routing linh hoạt (topic/direct), ack/nack, prefetch, DLQ, dễ chạy local, phù hợp event-driven vừa/nhỏ.
- Nhược: throughput không bằng Kafka, ordering chỉ “tốt nhất” trong từng queue, cần thiết kế idempotency.

**Redis (Streams/PubSub)**
- Ưu: đơn giản, latency thấp.
- Nhược: PubSub không durable; Streams durable nhưng phải tự xử lý nhiều thứ (DLQ, retry, consumer groups) và thiếu routing kiểu topic.

**Kafka**
- Ưu: throughput rất cao, replay tốt, log-based.
- Nhược: vận hành nặng hơn, local dev phức tạp hơn; với Travel Web hiện tại là “overkill”.

**AWS SQS**
- Ưu: managed, bền, đơn giản.
- Nhược: khóa chặt cloud, routing hạn chế (cần SNS/SQS), local dev khó.

**Kết luận chọn RabbitMQ**
- Dự án đã có RabbitMQ trong compose chính.
- Cần routing dạng topic cho `booking.*`, `payment.*`.
- Cần DLQ/ack/prefetch và vận hành “vừa sức” cho đồ án/defense.

---

## Luồng xử lý (Diagrams)
Xem Mermaid tại [diagrams/booking-flow.mmd](../diagrams/booking-flow.mmd).

---

## Exchange/Queue design
**Exchange**
- `events` (type: `topic`, durable: true)
- `dlx` (dead-letter exchange, type: `topic`, durable: true)

**Routing keys (chuẩn hoá)**
- `booking.created`
- `booking.held`
- `booking.confirmed`
- `booking.cancelled`
- `booking.status.updated`
- `payment.completed`
- `payment.refunded`

**Queue gợi ý**
- Booking service consumers:
  - `booking-service.payment-events` bind: `payment.*`
- Payment service consumers:
  - `payment-service.booking-events` bind: `booking.created`
- Notification service consumers:
  - `notification-service.events` bind: `booking.*`, `payment.*`

**Durable/persistent**
- Exchange/queue: `durable: true`
- Message publish: `persistent: true`
- Consumer: manual ack (`ch.ack`), poison -> `nack(requeue=false)` để vào DLQ.

---

## Outbox pattern
**Vấn đề**: Nếu HTTP tạo booking và publish message “tách rời”, có thể gặp trạng thái “DB commit thành công nhưng publish thất bại” (mất event) hoặc ngược lại.

**Giải pháp**: Outbox table trong cùng transaction với domain write.

### Prisma schema (booking-service)
- Outbox đã có sẵn trong [services/booking-service/prisma/schema.prisma](../services/booking-service/prisma/schema.prisma)
- ProcessedEvent bổ sung cho idempotency.

### Transactional pseudocode
```text
BEGIN
  INSERT booking
  INSERT outbox(event)
COMMIT

Worker:
  LOOP
    SELECT outbox WHERE published=false LIMIT N
    PUBLISH to RabbitMQ (persistent, messageId=outbox.id)
    UPDATE outbox SET published=true
```

### TypeScript example (Prisma transaction)
Xem tạo booking + outbox trong [services/booking-service/src/http/routes.ts](../services/booking-service/src/http/routes.ts).

### Outbox publisher worker (polling)
- Triển khai polling + backoff trong [services/booking-service/src/lib/outbox-publisher.ts](../services/booking-service/src/lib/outbox-publisher.ts)
- Knobs quan trọng:
  - `OUTBOX_BATCH_SIZE`
  - `OUTBOX_POLL_INTERVAL_MS`
  - `OUTBOX_IDLE_POLL_INTERVAL_MS`
  - `OUTBOX_MAX_BACKOFF_MS`

**Ghi chú throughput**
- Polling đơn giản, dễ demo.
- Với production: cân nhắc locking (SKIP LOCKED), multiple workers, hoặc tailing theo time/id.

---

## DLQ & Retry/Backoff
### DLQ (Dead Letter Queue)
Trong shared helper [packages/shared/src/event-bus/rabbitmq.ts](../packages/shared/src/event-bus/rabbitmq.ts), `rabbitConsume()`:
- Gắn queue args:
  - `x-dead-letter-exchange: dlx`
  - `x-dead-letter-routing-key: <queue>.dlq`
- Khi handler throw: `nack(requeue=false)` → message vào DLQ.

### Retry/Backoff với header `x-retry-count`
Repo có sẵn helper `rabbitConsumeWithRetry()` trong [packages/shared/src/event-bus/rabbitmq.ts](../packages/shared/src/event-bus/rabbitmq.ts).

Chiến lược khuyến nghị:
- Retry 3 lần: 1s → 10s → 60s
- Mỗi lần retry tăng `x-retry-count`
- Quá ngưỡng → DLQ

**Tradeoff**
- Retry bằng TTL queues cần topology rõ ràng; nếu chưa muốn phức tạp, dùng DLQ trước.

---

## Idempotency
Vì delivery thường là **at-least-once**, consumer phải idempotent.

### Schema: ProcessedEvent
- Booking: [services/booking-service/prisma/schema.prisma](../services/booking-service/prisma/schema.prisma)
- Payment: [services/payment-service/prisma/schema.prisma](../services/payment-service/prisma/schema.prisma)
- Notification: [services/notification-service/prisma/schema.prisma](../services/notification-service/prisma/schema.prisma)

### Helper
- [packages/shared/src/event-bus/idempotency.ts](../packages/shared/src/event-bus/idempotency.ts)

Cách dùng (ví dụ):
- Booking consumer: [services/booking-service/src/lib/payment-events-consumer.ts](../services/booking-service/src/lib/payment-events-consumer.ts)

**Nguyên tắc**
- Producer nên set `messageId` (ở đây: outbox.id) để idempotency có “key” ổn định.
- Nếu handler thất bại, helper xoá marker để retry có thể xử lý lại.

---

## Request-Response qua queue (RPC)
Khi cần request-response async (ít dùng hơn event), dùng `correlationId + replyTo`:
- Helper `rabbitRpc()` trong [packages/shared/src/event-bus/rabbitmq.ts](../packages/shared/src/event-bus/rabbitmq.ts)

Ví dụ:
```ts
import { rabbitRpc } from '@travel-web/shared';

const result = await rabbitRpc({
  routingKey: 'room.getAvailability',
  message: { roomId, checkIn, checkOut },
  timeoutMs: 3000,
});
```

---

## Saga pattern (Orchestration)
**Khi nào cần**: booking gồm nhiều bước cần tính nhất quán theo business (đặt phòng → thanh toán → xác nhận → gửi thông báo). Không dùng distributed transaction.

**Orchestrator** (BookingSaga) giữ state và ra quyết định compensation.

Skeleton (mẫu trình bày):
```ts
type SagaStep = {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
};

export async function runSaga(steps: SagaStep[]) {
  const completed: SagaStep[] = [];
  try {
    for (const step of steps) {
      await step.execute();
      completed.push(step);
    }
  } catch (err) {
    for (const step of completed.reverse()) {
      try { await step.compensate(); } catch { /* log */ }
    }
    throw err;
  }
}
```

---

## Message schema & validation (Ajv)
### Chuẩn message
Repo dùng `EventMessage` trong [packages/contracts/src/events.ts](../packages/contracts/src/events.ts):
- `id`, `type`, `source`, `occurredAt`, `version`, `data`

### Validation bằng JSON Schema + Ajv
Ví dụ validate `PaymentCompleted`:
- Schema/compiler: [services/booking-service/src/lib/event-validation.ts](../services/booking-service/src/lib/event-validation.ts)
- Áp dụng trong consumer: [services/booking-service/src/lib/payment-events-consumer.ts](../services/booking-service/src/lib/payment-events-consumer.ts)

---

## Security & hardening
- **Auth RabbitMQ**: user/password riêng cho từng môi trường; không dùng guest trong prod.
- **Network isolation**: chỉ cho phép service network nội bộ truy cập port 5672.
- **TLS**: bật TLS cho AMQPS (prod/staging).
  - Staging (self-signed) – ví dụ tạo nhanh:
    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout rabbitmq.key -out rabbitmq.crt -days 365 -nodes \
      -subj "/CN=rabbitmq"
    ```
    Mount `rabbitmq.crt`/`rabbitmq.key` vào container RabbitMQ và cấu hình listeners SSL.
  - Prod: dùng CA nội bộ hoặc dịch vụ quản lý cert (tuỳ hạ tầng).
- **Schema validation**: consumer validate message trước khi xử lý.
- **Least privilege**: RabbitMQ vhosts + permissions theo exchange/queues.
- (Optional) **Message signing**: ký payload + verify signature (nếu cần chống giả mạo trong môi trường phức tạp).

### Rotate credentials (gợi ý)
- Tạo user mới + permission đầy đủ
- Deploy app dùng credentials mới
- Revoke user cũ
- Audit logs (nếu bật) + rotate định kỳ

---

## Durability & delivery semantics
- Exchange/queue durable + message persistent.
- Consumer manual ack.
- Poison message → nack(requeue=false) → DLQ.
- Delivery semantics: **at-least-once**, nên bắt buộc idempotency.

---

## Scaling & performance
- Scale ngang consumer: tăng replicas, tune `prefetch`.
- Ví dụ knobs:
  - `prefetch=20` cho notification (I/O bound)
  - `prefetch=5-10` cho booking/payment (DB bound)
- Throughput phụ thuộc DB + latency external.

---

## Monitoring & observability
Repo expose Prometheus `/metrics`:
- Booking: `http://booking-service:3002/metrics`
- Payment: `http://payment-service:3004/metrics`
- Notification: `http://notification-service:3006/metrics`
- (Gateway đã có) `http://api-gateway:4000/metrics`

Metrics đã implement (tên thật trong code):
- Booking:
  - `booking_rabbitmq_consume_total{queue,routingKey,eventType,status}`
  - `booking_rabbitmq_consume_duration_seconds_bucket{queue,routingKey,eventType,...}`
  - `booking_outbox_published_total{routingKey}`
  - `booking_outbox_publish_errors_total`
  - `booking_outbox_publish_duration_seconds_bucket{routingKey,...}`
  - `booking_outbox_batch_size_bucket{...}`
- Payment:
  - `payment_rabbitmq_consume_total{queue,routingKey,eventType,status}`
  - `payment_rabbitmq_consume_duration_seconds_bucket{queue,routingKey,eventType,...}`
  - `payment_rabbitmq_publish_total{routingKey,status}`
  - `payment_rabbitmq_publish_duration_seconds_bucket{routingKey,...}`
- Notification:
  - `notification_rabbitmq_consume_total{queue,routingKey,eventType,status}`
  - `notification_rabbitmq_consume_duration_seconds_bucket{queue,routingKey,eventType,...}`
  - `notification_persist_total{status,type}`

PromQL gợi ý:
- Consume error rate (booking):
  - `sum(rate(booking_rabbitmq_consume_total{status="error"}[5m])) / sum(rate(booking_rabbitmq_consume_total[5m]))`
- p95 handler duration (payment):
  - `histogram_quantile(0.95, sum by (le) (rate(payment_rabbitmq_consume_duration_seconds_bucket[5m])))`
- Outbox publish errors (booking):
  - `rate(booking_outbox_publish_errors_total[5m])`

Gợi ý Grafana panels:
- Queue depth (RabbitMQ): messages_ready/messages_unacked
- Consumer lag: rate(consumed) vs produced
- Histogram: handler duration p50/p95/p99
- DLQ size theo queue

---

## Testing
### Unit test
- Ưu tiên test pure functions (routing key mapping, validation).

### Integration test (Compose)
- Test end-to-end: [tests/integration/booking-queue.test.js](../tests/integration/booking-queue.test.js)
- Chạy bằng:
```bash
npm run test:integration
```

---

## Troubleshooting
**1) Queue không nhận message**
- Mở RabbitMQ UI: http://localhost:15672 (guest/guest)
- Check exchange `events`, bindings, routing keys.

**2) Message vào DLQ**
- Kiểm tra logs của consumer.
- Xem DLQ queue `<queue>.dlq` trong UI.

**3) Prisma migrate fail trong container**
- Check env `*_DATABASE_URL`.
- Check Postgres health.

**Lệnh hữu ích**
```bash
docker compose -f docker-compose.queue.yml --profile full ps

docker compose -f docker-compose.queue.yml --profile full logs -f booking-service

docker exec -it tw-queue-rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged
```

---

## Environment variables
**RabbitMQ**
- `RABBITMQ_URL=amqp://user:pass@rabbitmq:5672`
- `RABBITMQ_EXCHANGE=events`
- `RABBITMQ_DLX_EXCHANGE=dlx`

**Booking service**
- `BOOKING_DATABASE_URL=postgresql://.../booking_db`
- `ENABLE_OUTBOX_PUBLISHER=true`
- `OUTBOX_BATCH_SIZE=50`
- `OUTBOX_POLL_INTERVAL_MS=500`
- `OUTBOX_IDLE_POLL_INTERVAL_MS=1500`
- `OUTBOX_MAX_BACKOFF_MS=15000`
- `ENABLE_PAYMENT_EVENTS_CONSUMER=true`
- `RABBITMQ_QUEUE_PAYMENT_EVENTS=booking-service.payment-events`

**Payment service**
- `PAYMENT_DATABASE_URL=postgresql://.../payment_db`
- `ENABLE_BOOKING_EVENTS_CONSUMER=true`
- `RABBITMQ_QUEUE_BOOKING_EVENTS=payment-service.booking-events`

**Notification service**
- `NOTIFICATION_DATABASE_URL=postgresql://.../notification_db`
- `NOTIFICATION_FALLBACK_EMAIL=demo@example.com`

---

## Checklist production
- [ ] Tách vhost RabbitMQ theo env (dev/staging/prod)
- [ ] Bật TLS (amqps) + rotate credentials
- [ ] Thiết lập DLQ + alert khi DLQ tăng
- [ ] Idempotency tables + unique constraints
- [ ] Schema validation trong consumer
- [ ] Prefetch tuning + autoscale
- [ ] Prometheus scrape + dashboards
- [ ] Log correlationId/causeId
- [ ] Backup/retention policy cho processed_events/outbox
- [ ] Runbook troubleshoot + replay strategy

---

## FAQ + câu hỏi GV hay hỏi
1) **Tại sao cần Outbox?**
- Để đảm bảo publish event không bị “lệch” so với DB commit (atomicity ở mức ứng dụng).

2) **At-least-once có vấn đề gì?**
- Message có thể xử lý lại. Giải pháp: idempotency + thiết kế handler idempotent.

3) **Tại sao không dùng Kafka?**
- Overkill cho scope, vận hành nặng; RabbitMQ đáp ứng routing + DLQ + dev nhanh.

4) **DLQ để làm gì?**
- Cô lập poison message, tránh crash loop; giúp điều tra và replay có kiểm soát.

5) **Nếu RabbitMQ down?**
- Outbox giữ event trong DB; publisher retry/backoff; khi broker lên lại sẽ publish tiếp.

---

## What I would demo (3 bước)
1) Khởi động queue demo:
```bash
docker compose -f docker-compose.queue.yml --profile full up -d --build
```
Kỳ vọng: rabbitmq/postgres + booking/payment/notification đều up.

2) Tạo booking:
```bash
curl -X POST http://localhost:3002/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","roomId":"r1","checkIn":"2026-02-16T00:00:00.000Z","checkOut":"2026-02-17T00:00:00.000Z","totalPrice":"100.00","numberOfGuests":1}'
```
Kỳ vọng: booking status chuyển `CONFIRMED` sau vài giây.

3) Xem DB và notifications:
- RabbitMQ UI: http://localhost:15672
- PG: query `booking.bookings` và `notify.notifications`

---

## Gợi ý git commit history
1) `feat(queue): add ProcessedEvent + shared idempotency helper`
2) `feat(queue): standardize EventMessage + outbox payloads`
3) `feat(queue): add payment booking.created consumer + payment.completed publisher`
4) `chore(queue): add docker-compose.queue.yml + generic Dockerfile`
5) `test(queue): add integration test via compose`
6) `docs(queue): add architecture doc + diagrams + presentation`

---

## Deployment notes (Docker Swarm / Kubernetes)
**Docker Swarm (high-level)**
- Dùng secrets/configs cho `RABBITMQ_URL`, DB URLs
- Rolling update workers theo từng service
- Pin resources (CPU/mem) để tránh OOM-kill khi backlog tăng

**Kubernetes (high-level)**
- Tách Deployment cho API và worker (nếu tách process)
- `livenessProbe`: kiểm tra process sống (ví dụ `/health`)
- `readinessProbe`: kiểm tra dependencies sẵn sàng (DB/RabbitMQ) (ví dụ `/ready`)
- HPA theo CPU hoặc theo custom metrics (queue depth/processing lag)
- NetworkPolicy: chỉ cho phép namespace/service cần thiết truy cập RabbitMQ/Postgres
