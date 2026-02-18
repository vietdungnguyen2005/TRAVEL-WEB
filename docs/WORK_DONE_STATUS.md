# Travel Web — Tình trạng công việc (tới 2026-02-17)

Tài liệu này tổng hợp **những phần đã có trong repo**: công nghệ, tính năng/thành phần, và logic hoạt động (đặc biệt luồng booking qua RabbitMQ + Outbox).

## 1) Công nghệ / Stack đã dùng

### Monorepo & tooling
- NPM workspaces + Turborepo: điều phối build/dev/test trong toàn repo (root `package.json`, `turbo.json`).
- TypeScript (repo-wide), ESLint, Jest.
- Docker Compose để chạy local môi trường đầy đủ.

### Frontend (web)
- Next.js 16 + React 19.
- UI libs: Radix UI, Tailwind CSS, React Hook Form, Zod, Zustand.

### Backend (microservices)
- Node.js + TypeScript.
- Express cho HTTP services (ví dụ booking/payment/notification).

### Data & integrations
- PostgreSQL + Prisma (mỗi service dùng schema riêng; Prisma `multiSchema`).
- Redis (có trong compose queue demo; mục tiêu cache/rate-limit).
- RabbitMQ (topic exchange) cho event-driven.
- Stripe, Supabase, Cloudinary, Resend/Nodemailer: đã có dependencies cho các tích hợp.

## 2) Các tài liệu/diagram đã có
- Kiến trúc queue tổng thể: `docs/queue-architecture.md`.
- Quy ước Clean Architecture (incremental): `docs/CLEAN_ARCHITECTURE.md`.
- Checklist triển khai RabbitMQ/queue: `docs/checklist.md`.
- Diagram Mermaid luồng booking: `diagrams/booking-flow.mmd`.

## 3) Thành phần “shared” (dùng lại giữa các service)

### 3.1. Contract sự kiện (schema envelope)
- `packages/contracts/src/events.ts`
  - `EventMessage`: envelope chuẩn hoá event gồm `id`, `type`, `source`, `occurredAt`, `version`, `correlationId`, `causationId`, `data`.

### 3.2. RabbitMQ helper (connect/publish/consume/DLQ/retry)
- `packages/shared/src/event-bus/rabbitmq.ts`
  - `rabbitConnect()`: connect + assert exchange `events` và DLX `dlx` (durable).
  - `rabbitPublish()`: publish JSON message (persistent).
  - `rabbitConsume()`: consume manual ack, lỗi thì `nack(requeue=false)` để tránh poison-loop; có DLQ per-queue.
  - `rabbitConsumeWithRetry()`: cơ chế retry theo `x-retry-count` và publish sang `retry` exchange (TTL queue) trước khi DLQ.
  - `rabbitRpc()`: RPC qua queue (correlationId + replyTo) nếu cần.

### 3.3. Idempotency cho consumer (Prisma)
- `packages/shared/src/event-bus/idempotency.ts`
  - `withEventIdempotency(prisma, {consumer, messageId, ...}, fn)`:
    - insert vào bảng `ProcessedEvent` (unique `(consumer, messageId)`)
    - nếu trùng -> `skipped`
    - nếu handler fail -> xoá marker để retry xử lý lại.

## 4) Tính năng đã triển khai theo service

## 4.1. booking-service

### API chính
- `services/booking-service/src/http/routes.ts`
  - `GET /api/bookings/my-bookings`: lấy booking theo user (ưu tiên JWT; fallback query param).
  - `GET /api/bookings`: list bookings (optional filter userId).
  - `POST /api/bookings`: tạo booking (status=PENDING) + ghi outbox **trong cùng transaction**.
  - `POST /api/bookings/hold`: tạo booking ON_HOLD (15 phút) + outbox.
  - `POST /api/bookings/check-availability`: check conflict theo time range (CONFIRMED/ON_HOLD).
  - `POST /api/bookings/:id/cancel`: huỷ booking + outbox `BookingCancelled`.

### Admin flow (duyệt booking)
- `services/booking-service/src/http/routes.ts`
  - `GET /api/bookings/admin/bookings?status=PENDING`: admin list.
  - `PATCH /api/bookings/admin/bookings/:id/status`: cập nhật status.
    - Luôn ghi outbox `BookingStatusUpdated`.
    - Nếu set `CONFIRMED` thì ghi thêm outbox `BookingConfirmed`.

### Outbox publisher (transactional publish)
- `services/booking-service/src/lib/outbox-publisher.ts`
  - Chạy khi `ENABLE_OUTBOX_PUBLISHER=true` và `DISABLE_RABBITMQ!=true`.
  - Poll `Outbox(published=false)` theo batch.
  - Publish RabbitMQ với:
    - routingKey map từ `(aggregateType, eventType)` (vd `booking.created`)
    - `messageId = outbox.id` để consumer idempotent.
  - Mark `published=true` sau khi publish.

### Consumer nhận event payment
- `services/booking-service/src/lib/payment-events-consumer.ts`
  - Chạy khi `ENABLE_PAYMENT_EVENTS_CONSUMER=true`.
  - Consume queue `booking-service.payment-events` bind `payment.*`.
  - Idempotency: dùng `ProcessedEvent` theo `messageId`.
  - Với `PaymentCompleted/PaymentConfirmed`:
    - update booking → `status=CONFIRMED`, `paymentStatus=PAID`
    - ghi outbox `booking.confirmed` (để bắn tiếp cho notification/consumer khác).

### Health/metrics & composition root
- `services/booking-service/src/index.ts`
  - Expose `/healthz`, `/ready`, `/metrics`.
  - Startup: chạy outbox publisher + payment-events consumer.

### Prisma schema (Outbox + ProcessedEvent)
- `services/booking-service/prisma/schema.prisma`
  - `Outbox` có index `(published, createdAt)`.
  - `ProcessedEvent` unique `(consumer, messageId)`.

## 4.2. payment-service

### Consumer nhận event booking.created
- `services/payment-service/src/lib/booking-events-consumer.ts`
  - Chạy khi `ENABLE_BOOKING_EVENTS_CONSUMER=true`.
  - Consume queue `payment-service.booking-events` bind `booking.created`.
  - Upsert Payment -> status `COMPLETED` (rule demo).
  - Publish event chuẩn `EventMessage<'PaymentCompleted'>` với routingKey `payment.completed`.
  - Idempotency cho consumer qua `ProcessedEvent`.

### API thanh toán (Stripe + non-stripe)
- `services/payment-service/src/index.ts`
  - `/api/payments/create-checkout`: tạo Stripe checkout session + upsert Payment.
  - `/api/payments/verify`: verify session paid -> update Payment + publish PaymentCompleted (routingKey `payment.completed`).
  - `/api/payments/confirm`: confirm payment (cash/other) (có logic PENDING vs COMPLETED).
  - Có readiness check DB + RabbitMQ (`/ready`), liveness (`/healthz`).

### Idempotency cho HTTP
- `services/payment-service/src/index.ts`
  - Bảng `IdempotencyKey` (scope + key) để chặn double submit (thường dùng cho create/confirm/refund).

### Prisma schema
- `services/payment-service/prisma/schema.prisma`
  - `Payment`, `IdempotencyKey`, `ProcessedEvent`.

## 4.3. notification-service

### Consumer nhận booking.* và payment.*
- `services/notification-service/src/index.ts`
  - Consume queue `notification-service.events` bind `booking.*` và `payment.*`.
  - Persist notification row (status `PENDING`) để xử lý retryable.
  - Idempotency theo `ProcessedEvent`.
  - Hiện tại là demo: chưa gửi email thật; lưu “to/subject/payload” để về sau worker gửi.

### Prisma schema
- `services/notification-service/prisma/schema.prisma`
  - `Notification` (PENDING/SENT/FAILED) + `ProcessedEvent`.

## 5) Logic hoạt động (flow chính đã có)

### 5.1. Queue demo: booking → outbox → RabbitMQ → payment → booking confirm → notification
- Diagram: `diagrams/booking-flow.mmd`.
- Tóm tắt:
  1) Client gọi `POST /api/bookings`.
  2) booking-service tạo booking + ghi outbox `BookingCreated` trong cùng transaction.
  3) outbox-publisher publish `booking.created` (messageId=outbox.id).
  4) payment-service consumer nhận `booking.created` → upsert Payment (COMPLETED) → publish `payment.completed`.
  5) booking-service consumer nhận `payment.*` → update booking CONFIRMED/PAID → ghi outbox `booking.confirmed`.
  6) notification-service consumer nhận `booking.*`/`payment.*` → insert Notification(PENDING).

### 5.2. Semantics & độ an toàn
- Delivery chủ đạo là **at-least-once**, nên:
  - Producer set `messageId` ổn định (outbox.id).
  - Consumer dùng `ProcessedEvent` để idempotent.
  - Khi handler throw -> RabbitMQ `nack(requeue=false)` -> DLQ (nếu bật).

## 6) Infra chạy demo + test tích hợp

### Docker compose queue demo
- `docker-compose.queue.yml`
  - RabbitMQ (management UI), Redis, Postgres.
  - booking-service chạy mặc định.
  - payment-service + notification-service bật bằng `--profile full`.

### Integration test end-to-end
- `tests/integration/booking-queue.test.js`
  - `docker compose ... up -d --build`.
  - Gọi API booking.
  - Chờ DB: booking status CONFIRMED và notification row xuất hiện.

## 7) Ghi chú phần còn “chưa hoàn thiện” (nhìn từ code/docs)
- Notification: mới persist, chưa có worker gửi email/SMS thật.
- Saga compensation (refund/cancel) có mô tả trong docs/diagram, nhưng hiện tại chủ yếu là demo success-path.
- Payment routingKey đã chuẩn hoá về `payment.completed` (loại bỏ legacy `payment.paymentcompleted`).

---

Nếu bạn muốn, mình có thể tiếp tục tạo thêm một file “roadmap / việc cần làm tiếp theo” theo đúng kiến trúc trong `docs/queue-architecture.md` (retry TTL queues chuẩn, DLQ replay, chuẩn hoá routing keys, tách clean architecture theo 1 vertical slice).