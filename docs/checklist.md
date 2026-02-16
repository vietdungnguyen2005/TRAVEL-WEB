# Deployment checklist (Queue / RabbitMQ) — Travel Web

## 1) Cấu hình môi trường
- [ ] Tách `.env` theo dev/staging/prod; không commit secrets
- [ ] `RABBITMQ_URL` dùng user riêng (không dùng guest)
- [ ] `*_DATABASE_URL` đúng schema/DB theo từng service

## 2) RabbitMQ hardening
- [ ] Bật TLS (amqps) cho staging/prod
- [ ] Dùng vhost riêng: `/travel-web-prod`
- [ ] Permission theo nguyên tắc least privilege
- [ ] Disable default guest hoặc giới hạn network

## 3) Topology & durability
- [ ] Exchange `events` durable + type topic
- [ ] DLX `dlx` durable
- [ ] Queues durable + persistent messages
- [ ] Prefetch phù hợp theo workload

## 4) Outbox
- [ ] Outbox table có index `(published, createdAt)`
- [ ] Publisher có backoff + giới hạn batch
- [ ] Monitor outbox lag

## 5) Idempotency
- [ ] `ProcessedEvent` unique `(consumer, messageId)`
- [ ] Producer luôn set `messageId` (dùng outbox.id)

## 6) Retry/DLQ
- [ ] DLQ cho mọi queue consumer
- [ ] Alert khi DLQ > 0
- [ ] Chiến lược retry/backoff rõ ràng (x-retry-count)

## 7) Observability
- [ ] Prometheus scrape `/metrics`
- [ ] Grafana dashboards: queue depth, unacked, handler duration, DLQ size
- [ ] Logs có correlationId/causationId

## 8) Release/rollout
- [ ] Chạy migrations trước khi rollout consumers
- [ ] Canary deploy cho consumer quan trọng
- [ ] Rollback plan

## 9) Incident runbook
- [ ] Quy trình replay DLQ
- [ ] Quy trình purge poison message
- [ ] Quy trình rotate credentials

## 10) Smoke test
- [ ] Publish test event (booking.created)
- [ ] Verify booking confirmed + notification persisted
