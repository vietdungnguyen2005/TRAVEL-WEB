# Travel Web (Monorepo)

Mục tiêu README này: giúp bạn **chạy được Web UI trên máy mới nhanh nhất** (thường ~3–5 phút tuỳ tốc độ kéo image/build).

## Quickstart (Windows/macOS/Linux) — chạy được Web trong vài phút

### 0) Yêu cầu
- Git
- Docker Desktop (bật WSL2 trên Windows)
- Node.js >= 18 (khuyến nghị 20) + npm

### 1) Clone repo + tạo file môi trường cho Docker

Tại thư mục repo, tạo file `.env` (hoặc copy từ `.env.example` rồi sửa) với cấu hình tối thiểu:

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Sau đó mở `.env` và đảm bảo có (tối thiểu) các biến sau:
```env
POSTGRES_PASSWORD=postgres
JWT_SECRET=dev-secret
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Optional (có cũng được, để mở được dashboard)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

Ghi chú:
- Root `.env.example` chứa nhiều biến cho Supabase/Stripe/Cloudinary… nhưng để chạy local nhanh thì **chỉ cần** các biến tối thiểu ở trên.

### 2) Chạy full system bằng Docker Compose (Web + API Gateway + microservices)

Chạy từ thư mục repo (root):

```powershell
docker compose --project-directory . -f apps/gateway/docker-compose.yml up -d --build
```

Vì sao có `--project-directory .`?
- File compose nằm ở `apps/gateway/docker-compose.yml` nhưng dùng path tương đối kiểu `./services/...`, `./infra/...`.
- `--project-directory .` buộc Docker Compose resolve path theo repo root, tránh lỗi “không tìm thấy services/infra”.

Kiểm tra backend đã sẵn sàng:
- API Gateway: http://localhost:4000/healthz (200)
- Web UI: http://localhost:3000
- RabbitMQ UI: http://localhost:15672 (user/pass theo `RABBITMQ_USER`/`RABBITMQ_PASSWORD`, mặc định `guest/guest`)
- Grafana: http://localhost:3007 (nếu dùng, login theo `GRAFANA_ADMIN_USER`/`GRAFANA_ADMIN_PASSWORD`)

### 3) Dev mode (tuỳ chọn): chạy Web bằng Node (không Docker)

Nếu bạn muốn hot-reload nhanh hơn cho UI, có thể chạy web local và vẫn dùng backend Docker:

```powershell
npm install
cd apps/web
npm run dev
```

Tạo `apps/web/.env.local` nếu cần:
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

### 4) Chạy bằng Docker (không dùng npm run dev)

Chạy toàn bộ hệ thống (web + gateway + services) bằng Docker:

```powershell
docker compose --project-directory . -f apps/gateway/docker-compose.yml up -d --build
```

Chỉ chạy backend bằng Docker, còn web chạy local:

```powershell
docker compose --project-directory . -f apps/gateway/docker-compose.yml up -d \
	auth-service booking-service room-service payment-service review-service notification-service api-gateway rabbitmq redis
```

Sau đó chạy web local:

```powershell
cd apps/web
npm run dev
```

## Tình trạng đã làm (tóm tắt)

- Monorepo + tooling: NPM workspaces, Turborepo, TypeScript, ESLint, Jest.
- Frontend: Next.js 16 + React 19, Tailwind, Radix UI, Zustand, React Hook Form.
- Backend: microservices Node/Express (booking, payment, notification, auth, room, review, blog, content, api-gateway).
- Messaging: RabbitMQ (topic exchange), outbox publisher, idempotent consumers, DLQ/retry.
- Data: PostgreSQL + Prisma (mỗi service schema riêng), Redis.
- Observability: metrics endpoints, correlationId logs.
- Diagrams/docs: luồng booking, cancel/refund, queue architecture.

Chi tiết đầy đủ: xem `docs/WORK_DONE_STATUS.md`.

## Ports mặc định
- Web (Next dev): `3000`
- API Gateway: `4000`
- RabbitMQ: `5672` / RabbitMQ UI: `15672`
- Consul UI: `8500`
- Prometheus: `9090`
- Grafana: `3007`

## Dừng hệ thống

Dừng backend (và xoá volume DB nếu muốn clean slate):
```powershell
docker compose --project-directory . -f apps/gateway/docker-compose.yml down -v
```

Dừng web: `Ctrl + C` trong terminal đang chạy `npm run dev`.

## Troubleshooting nhanh

### 1) Docker Compose báo không tìm thấy path `./services/*` hoặc `./infra/*`
Bạn đang thiếu `--project-directory .`. Hãy chạy đúng lệnh ở Quickstart bước 2.

### 2) Web báo thiếu env `NEXT_PUBLIC_API_GATEWAY_URL`
Tạo/kiểm tra `apps/web/.env.local` và chạy lại `npm run dev`.

### 3) Port bị chiếm (EADDRINUSE)
- Tắt process đang dùng port đó, hoặc đổi port mapping trong compose / đổi `PORT` khi chạy web: `npm run dev -- -p 3001`.

## Observability

- **CorrelationId**: gửi header `x-correlation-id` (hoặc `x-request-id`) vào bất kỳ request nào; log JSON sẽ tự có field `correlationId`.
- **Metrics**:
	- booking-service: http://localhost:3002/metrics
	- payment-service: http://localhost:3004/metrics
	- notification-service: http://localhost:3006/metrics
	- api-gateway: http://localhost:4000/metrics

## Diagrams & Samples

- Booking flow: `diagrams/booking-flow.mmd`
- Cancel/refund flow: `diagrams/booking-cancel-refund.mmd`
- Sample payloads: `docs/SAMPLE_EVENT_PAYLOADS.md`

---

Tài liệu trạng thái những phần đã làm trong repo: xem `docs/WORK_DONE_STATUS.md`.
