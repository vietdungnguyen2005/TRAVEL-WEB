# Thuyết trình 5–7 phút: Tích hợp Message Queue (RabbitMQ) cho Travel Web

## Slide outline (5–7 phút)

### Slide 1 — Bài toán
- Travel Web có nhiều microservice: booking, payment, notification...
- Nếu xử lý đồng bộ qua HTTP: dễ timeout, coupling chặt, khó scale
- Mục tiêu: event-driven để tách rời, tăng độ bền, dễ quan sát

**Speaker notes (30–45s)**
- “Mình muốn biến luồng đặt phòng thành chuỗi event: booking.created → payment.completed → booking.confirmed → notification.”

### Slide 2 — Vì sao RabbitMQ
- Routing linh hoạt (topic)
- Ack/nack + DLQ có sẵn
- Dễ chạy local + đã có trong dự án

**Speaker notes (30–45s)**
- “Kafka rất mạnh nhưng nặng vận hành; với scope đồ án, RabbitMQ cân bằng tốt.”

### Slide 3 — Topology (Exchange/Queue)
- Exchange: `events` (topic), DLX: `dlx`
- Routing keys: `booking.created`, `payment.completed`, `booking.confirmed`...
- Queue: per-consumer, durable + persistent messages

**Speaker notes (45–60s)**
- “Topic exchange giúp tách consumer theo domain: notification nghe `booking.*` và `payment.*`.”

### Slide 4 — Outbox pattern (điểm ăn tiền)
- Ghi booking + ghi outbox trong cùng transaction
- Worker publish outbox ra RabbitMQ
- Nếu broker down: outbox vẫn giữ, publish lại sau

**Speaker notes (60–75s)**
- “Outbox giải quyết vấn đề atomicity giữa DB và MQ; đây là lý do kiến trúc ‘defendable’.”

### Slide 5 — Idempotency + DLQ
- Delivery at-least-once → consumer có thể xử lý lại
- `ProcessedEvent(consumer, messageId)` để skip duplicates
- Poison message → DLQ để điều tra/replay

**Speaker notes (60–75s)**
- “Không có idempotency thì retry sẽ gây double charge/double confirm.”

### Slide 6 — Observability & test
- Metrics: publish/consume/duration/DLQ size
- Integration test: compose up → tạo booking → assert booking CONFIRMED + notification row

**Speaker notes (45–60s)**
- “Mình có test end-to-end chạy được trên CI. Đây là bằng chứng hệ thống hoạt động.”

### Slide 7 — Demo (3 bước)
1) `docker compose -f docker-compose.queue.yml --profile full up -d --build`
2) `curl POST /api/bookings`
3) Xem booking status + notifications + RabbitMQ UI

---

## Kịch bản nói (dạng bullet theo phút)

**Phút 0–1**
- Nêu bài toán: booking gồm nhiều bước, HTTP đồng bộ gây coupling và timeout
- Mục tiêu: event-driven, decouple, scale

**Phút 1–2**
- Chọn RabbitMQ: topic exchange, DLQ, dễ chạy local
- Nêu routing keys và queue theo từng consumer

**Phút 2–4**
- Trình bày Outbox: transaction + worker publish
- Demo flow: booking.created phát từ outbox, payment-service consume

**Phút 4–5**
- Idempotency: ProcessedEvent, messageId, xử lý at-least-once
- DLQ: poison message không phá hệ thống

**Phút 5–6**
- Observability: metrics và dashboard đề xuất
- Integration test chứng minh end-to-end

**Phút 6–7**
- Tổng kết tradeoffs + hướng production: TLS, rotate credentials, autoscale, retry strategy

---

## 10 câu hỏi GV hay hỏi + trả lời ngắn
1) **Tại sao không publish trực tiếp sau khi insert booking?**
- Vì có thể DB commit OK nhưng publish fail → mất event. Outbox giải quyết.

2) **At-least-once có rủi ro gì?**
- Duplicate processing. Giải pháp: idempotency + handler idempotent.

3) **DLQ dùng để làm gì?**
- Cô lập poison message, điều tra nguyên nhân, replay có kiểm soát.

4) **Nếu RabbitMQ downtime?**
- Outbox giữ sự kiện; publisher retry/backoff; khi broker lên lại publish tiếp.

5) **Ordering có đảm bảo không?**
- Không “tuyệt đối”. Nếu cần, thiết kế per-aggregate queue hoặc sequence number trong event.

6) **Vì sao không dùng Kafka?**
- Overkill cho scope, vận hành nặng. RabbitMQ đủ routing + DLQ + ack.

7) **Idempotency key lấy ở đâu?**
- `messageId` từ outbox id (ổn định) hoặc id event. Lưu vào ProcessedEvent.

8) **Retry/backoff làm thế nào?**
- Có thể dùng TTL queues hoặc re-publish theo delay, tăng `x-retry-count`, quá ngưỡng → DLQ.

9) **Làm sao quan sát throughput/lag?**
- Prometheus metrics + RabbitMQ metrics: queue depth, unacked, handler duration.

10) **Khi nào dùng RPC qua queue?**
- Khi cần request-response async (hiếm). Mặc định nên dùng event để giảm coupling.

---

## 5 câu hỏi khó (backup) + đáp án mẫu
1) **Outbox polling có bị chậm không?**
- Có tradeoff latency vs đơn giản. Có thể giảm poll interval, tăng batch size, hoặc dùng locking/streaming cho production.

2) **Nếu consumer xử lý xong DB nhưng ack thất bại?**
- Broker sẽ redeliver → idempotency sẽ skip (hoặc handler idempotent).

3) **Đảm bảo exactly-once có được không?**
- Khó trong distributed systems. Thực tế dùng at-least-once + idempotency.

4) **Schema evolve thế nào?**
- EventMessage có `version`. Consumer chấp nhận backward-compatible, validate theo version.

5) **Bảo mật broker?**
- TLS (amqps), rotate credentials, vhost/perms, network isolation, validation.
