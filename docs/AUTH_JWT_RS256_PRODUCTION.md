# Authentication Architecture (JWT RS256) — Production Spec

Ngày cập nhật: 2026-02-15

Tài liệu này mô tả kiến trúc Authentication cho hệ thống Hotel Booking Microservices dùng **JWT Access Token + Refresh Token** theo chuẩn production, chạy trên **PostgreSQL**.

---

## 1) Kiến trúc tổng thể

### ASCII diagram

```
                    (Public Internet)
                          |
                          v
                    +-------------+
                    |  Frontend   |
                    |  Web / App  |
                    +------+------+ 
                           |
          Authorization: Bearer <access_token>
                           |
                           v
                    +-------------+
                    | API Gateway |
                    |  (Edge)     |
                    +------+------+ 
                           |
          verify JWT (RS256) using cached public key/JWKS
          attach user context headers (x-user-id, x-user-role)
                           |
     +---------------------+------------------------------+
     |                     |                              |
     v                     v                              v
+------------+      +--------------+               +---------------+
| User Svc   |      | Booking Svc  |               | Payment Svc   |
| (profile)  |      | (booking)    |               | (charges)     |
+------------+      +--------------+               +---------------+
     |                     |                              |
     |                     v                              v
     |              +--------------+                +---------------+
     |              | Notification |<---------------|   Events      |
     |              | Service      |   (async)      | (Outbox/Bus)  |
     |              +--------------+                +---------------+
     |
     v
+----------------+
| Auth Service    |
| (credentials,   |
| JWT keys,       |
| refresh tokens) |
+----------------+
         |
         v
   +------------+
   | PostgreSQL  |
   | app_auth.*  |
   +------------+
```

### Ownership boundaries (khuyến nghị)

- **Auth Service**: credentials (email/password), keypair RS256, cấp phát access token, quản lý refresh token (rotate/revoke), logout all devices.
- **User Service**: hồ sơ người dùng (profile, addresses, preferences). Auth service chỉ giữ “tối thiểu” (id/email/role).
- **Gateway**: verify access token (không gọi auth-service mỗi request), forward sang service đích, rate limit/WAF.

---

## 2) Auth Flow (Register / Login / Verify / Refresh)

### 2.1 Register

1. FE gọi `POST /api/auth/register` với `email/password`.
2. Auth Service tạo user.
3. Auth Service trả `accessToken` (10–15 phút) + set cookie httpOnly `refresh_token` (7 ngày).

Ghi chú production:
- Nếu bật `REQUIRE_EMAIL_VERIFICATION=true`, endpoint register sẽ **không** trả token cho tới khi email verified.

### 2.2 Login

1. FE gọi `POST /api/auth/login`.
2. Auth Service xác thực mật khẩu (bcrypt).
3. Trả `accessToken` + set cookie `refresh_token`.

### 2.3 Request protected resource

1. FE gửi `Authorization: Bearer <access_token>`.
2. Gateway verify JWT (RS256), validate `iss`, `aud`, `typ=access`.
3. Gateway forward sang service tương ứng và set:
   - `x-user-id: <userId>`
   - `x-user-role: <role>`

### 2.4 Refresh token

1. Khi access token hết hạn, FE gọi `POST /api/auth/refresh`.
2. Auth Service đọc `refresh_token` từ cookie (ưu tiên) hoặc body.
3. Auth Service **rotate refresh token**:
   - refresh token là **opaque random string** (không phải JWT)
   - chỉ lưu **hash (SHA-256)** vào DB
   - refresh token cũ bị revoke và link `replacedByTokenId`
   - nếu phát hiện **replay** (reuse token đã rotate) → revoke toàn bộ “family” (logout all devices trong family)
4. Trả access token mới + set refresh cookie mới.

---

## 3) JWT Spec (RS256)

### Access Token

- **Algorithm**: RS256
- **TTL**: 10–15 phút (mặc định `15m`)
- **Payload tối thiểu**:
  - `sub` = userId
  - `role` = role
  - `typ` = `access`
- **Standard claims**:
  - `iss` (issuer)
  - `aud` (audience)
  - `iat`, `exp`
- **Header**:
  - `kid` để hỗ trợ rotate key

### Refresh Token

- Opaque random string
- TTL: 7 ngày
- Stored in DB as `tokenHash`

---

## 4) Database (PostgreSQL)

Auth service dùng schema `app_auth`.

Bảng chính:
- `User`
- `RefreshToken` (rotate/revoke + logout all devices)

Xem schema tại: services/auth-service/prisma/schema.prisma

---

## 5) Code mapping (workspace)

### Auth Service (Express)

- JWT RS256 + JWKS:
  - services/auth-service/src/lib/jwt.rs256.ts
  - JWKS endpoint: `GET /.well-known/jwks.json` trong services/auth-service/src/index.ts

- Refresh token store/rotate/revoke:
  - services/auth-service/src/lib/refresh-tokens.ts

- Auth endpoints:
  - `POST /api/auth/register` (issue access + refresh)
  - `POST /api/auth/login` (issue access + refresh)
  - `POST /api/auth/refresh` (rotate refresh + issue access)
  - `POST /api/auth/logout` (revoke current refresh)
  - `POST /api/auth/logout-all` (revoke all refresh tokens of user)

### API Gateway

- JWT verify middleware + JWKS caching:
  - services/api-gateway/src/middlewares/auth.middleware.ts

- Forward user context headers:
  - services/api-gateway/src/proxy/proxy.middleware.ts (sets `x-user-id`, `x-user-role`)

- Protected paths (default):
  - `/api/bookings*`, `/api/payments*`, `/api/admin*`

---

## 6) Folder structure (per service) — recommended

### api-gateway

```
services/api-gateway/src/
  middlewares/
    auth.middleware.ts
    rateLimit.middleware.ts
    ...
  proxy/
    proxy.middleware.ts
  routes/
    index.ts
```

### auth-service

```
services/auth-service/src/
  lib/
    jwt.rs256.ts
    refresh-tokens.ts
    prisma.ts
  modules/
    auth/
      auth.controller.ts
  http/
    routes.ts
    routes/logout.ts
```

### user-service (recommended)

```
services/user-service/src/
  modules/users/
  http/routes.ts
  lib/db.ts
```

### booking-service / payment-service / notification-service (recommended)

```
services/<service>/src/
  http/
  modules/
  lib/
```

---

## 7) Service-to-service communication

### Synchronous (HTTP)

- Gateway → services: HTTP proxy (đã có)
- Service → service: dùng internal DNS / Consul resolver (không đi qua public gateway) cho các use-case cần đồng bộ.

### Asynchronous (recommended)

- Booking/Payment publish events (outbox pattern) → Notification Service gửi email/SMS/push.
- Không dùng refresh token cho S2S. S2S nên dùng mTLS hoặc client-credentials / signed service tokens riêng.

---

## 8) Security best practices (production checklist)

- **Keys**: private key chỉ nằm ở Auth Service (KMS/Secret Manager). Gateway và các service chỉ cần **public key**.
- **Key rotation**: dùng `kid` + JWKS; gateway cache và refresh theo TTL.
- **Refresh token**:
  - lưu **hash** (không lưu plaintext)
  - rotate on every refresh
  - reuse detection → revoke whole family
- **Cookies**:
  - refresh token nên set `httpOnly`, `secure` (prod), `sameSite=lax/strict`
  - nếu refresh dùng cookie, cần bảo vệ CSRF (SameSite + CSRF token cho các endpoint state-changing)
- **Access token storage (FE)**: ưu tiên memory storage (tránh localStorage nếu có thể).
- **Gateway**:
  - rate limit / brute-force protection cho `/api/auth/login`
  - log correlation `x-request-id`
- **Audit**:
  - log login/refresh/revoke events (không log token)

---

## 9) Scaling (multi-instance)

- **Access token** stateless → scale gateway/service theo horizontal.
- **Auth Service**:
  - tất cả instance dùng cùng keypair và cùng DB
  - refresh rotation dùng transaction để tránh race
- **Gateway**:
  - cache JWKS theo TTL (in-memory per instance). Có thể nâng cấp dùng Redis cache nếu cần.
- **Logout all devices**:
  - `UPDATE refresh_tokens SET revokedAt=now() WHERE userId=? AND revokedAt IS NULL` chạy nhanh với index `userId`.

---

## 10) Environment variables (minimum)

### Auth Service

- `AUTH_DATABASE_URL` (PostgreSQL)
- `JWT_PRIVATE_KEY` hoặc `JWT_PRIVATE_KEY_BASE64`
- `JWT_PUBLIC_KEY` hoặc `JWT_PUBLIC_KEY_BASE64`
- `JWT_ISSUER=travel-web`
- `JWT_AUDIENCE=travel-web-api`
- `JWT_ACCESS_TTL=15m`
- `REFRESH_TOKEN_DAYS=7`
- `JWT_KID=auth-key-1`

### API Gateway

- `AUTH_SERVICE_URL=http://localhost:3001`
- `JWT_PUBLIC_KEY` (khuyến nghị cấu hình static) **hoặc** `AUTH_JWKS_URL` để fetch JWKS
- `JWT_ISSUER=travel-web`
- `JWT_AUDIENCE=travel-web-api`

