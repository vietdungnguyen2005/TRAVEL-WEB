# Thêm tài khoản Admin lên database Supabase

Tài khoản admin dùng để đăng nhập trang `/admin` được lưu trong **auth-service** (schema `app_auth`). Để thêm admin vào Supabase, dùng seed của auth-service và connection string Supabase.

**Mỗi service có file `.env` riêng** (ví dụ `services/auth-service/.env`). Script seed của auth-service tự động load biến môi trường từ `services/auth-service/.env` (ưu tiên `AUTH_DATABASE_URL`, không có thì dùng `DATABASE_URL`).

## 1. Lấy connection string Supabase

1. Vào [Supabase Dashboard](https://supabase.com) → chọn project.
2. **Settings** → **Database**.
3. Phần **Connection string** chọn **URI**.
4. Copy connection string (dạng `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres`).
5. Thay `[PASSWORD]` bằng mật khẩu database của project (Settings → Database → Database password).

## 2. Chạy migration (nếu chưa chạy)

Đảm bảo schema `app_auth` và bảng user đã có trên Supabase:

```bash
# Từ thư mục gốc repo (đã load env Supabase)
npm run migrate
```

Hoặc chỉ auth-service:

```bash
cd services/auth-service
AUTH_DATABASE_URL="postgresql://..." npx prisma migrate deploy --schema=prisma/schema.prisma
```

## 3. Seed tài khoản admin

Đảm bảo trong **`services/auth-service/.env`** có `DATABASE_URL` hoặc `AUTH_DATABASE_URL` trỏ tới Supabase (mỗi service dùng `.env` trong thư mục của nó).

**Cách 1 – Từ thư mục auth-service (khuyến nghị):**

```bash
cd services/auth-service
npm run db:seed
```

Seed sẽ tự load `services/auth-service/.env`, không cần set biến tay.

**Cách 2 – Từ thư mục gốc:**

```bash
npm run db:seed:auth
```

Khi chạy từ root, env có thể lấy từ shell hoặc file `.env` ở root; nếu bạn chỉ có `.env` trong từng service thì nên chạy từ **auth-service** (cách 1).

## 4. Thông tin đăng nhập admin

Sau khi seed thành công:

|        | Giá trị            |
|--------|--------------------|
| Email  | `admin@travel.com` |
| Mật khẩu | `admin123`      |

Đăng nhập tại `/auth/login`, sau đó sẽ được chuyển tới `/admin` nếu role là ADMIN.
