# Manual test: Payment Service admin auth (refund endpoints)

Mục tiêu: verify **không thể gọi** các endpoint admin refund khi **không có token**.

## Prerequisites
- Gateway: `http://localhost:4000`
- Ensure `JWT_SECRET` is set consistently for services (auth + payment + booking + room + blog). If `JWT_SECRET` differs, token verify sẽ fail.

## 1) Test: no token → 401
Chạy các lệnh sau (không gửi `Authorization` / không gửi cookie):

```bash
curl -i -X POST http://localhost:4000/api/payments/refund \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\",\"reason\":\"manual-test\"}"
```

Kỳ vọng:
- HTTP `401`
- body có `{ "error": "Unauthorized" }`

Tương tự cho:

```bash
curl -i -X POST http://localhost:4000/api/payments/refund-approve \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\"}"

curl -i -X POST http://localhost:4000/api/payments/refund-reject \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\",\"adminNote\":\"manual-test\"}"
```

## 2) Test: invalid token → 401

```bash
curl -i -X POST http://localhost:4000/api/payments/refund \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\"}"
```

Kỳ vọng: HTTP `401`.

## 3) Test: non-admin token → 403 (optional but recommended)
Nếu bạn có 1 JWT hợp lệ với `role=CUSTOMER`, gọi:

```bash
curl -i -X POST http://localhost:4000/api/payments/refund \
  -H "Authorization: Bearer <CUSTOMER_JWT>" \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\"}"
```

Kỳ vọng: HTTP `403` với `{ "error": "Forbidden" }`.

## 4) Test: admin token → không bị chặn bởi auth middleware

```bash
curl -i -X POST http://localhost:4000/api/payments/refund \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\":\"test-booking-id\",\"reason\":\"manual-test\"}"
```

Kỳ vọng:
- Không còn `401/403` từ auth middleware.
- Nếu `bookingId` không tồn tại: có thể nhận `404 Payment not found` (đây là đúng theo business logic).
