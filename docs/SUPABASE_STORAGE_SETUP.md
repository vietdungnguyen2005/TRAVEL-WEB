# Hướng dẫn Upload Ảnh lên Supabase Storage

## Vấn đề hiện tại
- Code đang tìm ảnh nhưng không có, dẫn đến crash
- Cần upload ảnh lên Supabase Storage để sử dụng

## Giải pháp đã triển khai

### 1. ✅ Đã tạo Supabase Storage Utility
- File: `apps/web/src/lib/supabase-storage.ts`
- Hỗ trợ upload và delete ảnh từ Supabase Storage

### 2. ✅ Đã tạo API Route cho Upload
- File: `apps/web/src/app/api/upload/image/route.ts`
- Endpoint: `POST /api/upload/image`
- Tự động fallback từ Supabase sang Cloudinary nếu Supabase không khả dụng

### 3. ✅ Đã thêm Error Handling
- Các component Image đã có xử lý lỗi khi ảnh không tồn tại
- Tự động fallback về placeholder nếu ảnh không load được

### 4. ✅ Đã cập nhật Next.js Config
- Cho phép load ảnh từ Supabase Storage domain

## Các bước thiết lập

### Bước 1: Tạo Supabase Project và Storage Bucket

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **Storage** trong sidebar
4. Tạo bucket mới tên `images`:
   - Click **New bucket**
   - Tên: `images`
   - Public bucket: **Bật** (để có thể truy cập ảnh công khai)
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### Bước 2: Lấy API Keys

1. Vào **Settings** → **API**
2. Copy các giá trị sau:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** (optional) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Bước 3: Cấu hình Environment Variables

Thêm vào file `.env.supabase` hoặc `.env`:

```env
# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-anon-key-here"
```

### Bước 4: Upload Ảnh Hiện Có lên Supabase

#### Cách 1: Sử dụng Script tự động

1. Tạo thư mục chứa ảnh cần upload:
   ```bash
   mkdir images-to-upload
   ```

2. Copy tất cả ảnh vào thư mục này

3. Chạy script:
   ```bash
   npx ts-node scripts/upload-images-to-supabase.ts
   ```

4. Script sẽ:
   - Tự động tạo bucket nếu chưa có
   - Upload tất cả ảnh trong thư mục
   - Tạo file `image-upload-mapping.json` với mapping URL

5. Sử dụng URLs từ file JSON để cập nhật database

#### Cách 2: Upload thủ công qua Supabase Dashboard

1. Vào **Storage** → **images** bucket
2. Click **Upload file**
3. Chọn ảnh và upload
4. Copy public URL của ảnh

#### Cách 3: Upload qua API trong ứng dụng

1. Sử dụng component `ImageUpload` đã có sẵn
2. Hoặc gọi API trực tiếp:
   ```typescript
   const formData = new FormData();
   formData.append('file', imageFile);
   
   const response = await fetch('/api/upload/image', {
     method: 'POST',
     body: formData,
   });
   
   const { url } = await response.json();
   ```

### Bước 5: Cập nhật Database với URLs mới

Sau khi upload ảnh, bạn cần cập nhật các bản ghi trong database:

#### Ví dụ với RoomType:
```sql
UPDATE room_types 
SET images = ARRAY[
  'https://your-project.supabase.co/storage/v1/object/public/images/travel-booking/image1.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/images/travel-booking/image2.jpg'
]
WHERE id = 'room-type-id';
```

#### Hoặc sử dụng Prisma:
```typescript
await prisma.roomType.update({
  where: { id: 'room-type-id' },
  data: {
    images: [
      'https://your-project.supabase.co/storage/v1/object/public/images/travel-booking/image1.jpg',
      'https://your-project.supabase.co/storage/v1/object/public/images/travel-booking/image2.jpg'
    ]
  }
});
```

## Cấu trúc Storage

```
images/ (bucket)
├── travel-booking/
│   ├── rooms/
│   │   ├── room-123-1234567890.jpg
│   │   └── room-456-1234567891.jpg
│   ├── hero-images/
│   │   └── hero-1234567890.jpg
│   └── avatars/
│       └── avatar-1234567890.jpg
```

## Troubleshooting

### Lỗi: "Supabase Storage is not configured"
- Kiểm tra lại các biến môi trường đã được set đúng chưa
- Đảm bảo file `.env.supabase` hoặc `.env` có các giá trị cần thiết

### Lỗi: "Bucket does not exist"
- Tạo bucket `images` trong Supabase Dashboard
- Hoặc chạy script upload sẽ tự động tạo bucket

### Lỗi: "Failed to upload image"
- Kiểm tra file size (tối đa 5MB)
- Kiểm tra file type (chỉ JPG, PNG, WEBP, GIF)
- Kiểm tra quyền của service_role key

### Ảnh không hiển thị
- Đảm bảo bucket được set là **Public**
- Kiểm tra URL có đúng format không
- Kiểm tra CORS settings trong Supabase (nếu cần)

## Security Notes

⚠️ **Quan trọng:**
- `SUPABASE_SERVICE_ROLE_KEY` là secret key, không bao giờ commit vào git
- Chỉ sử dụng service_role key ở server-side (API routes)
- Để public bucket chỉ chứa ảnh công khai
- Nếu cần ảnh private, tạo bucket riêng và sử dụng signed URLs

## Tích hợp với Code hiện tại

Code đã được cập nhật để:
- ✅ Tự động fallback từ Supabase sang Cloudinary nếu Supabase không khả dụng
- ✅ Xử lý lỗi khi ảnh không tồn tại (không còn crash)
- ✅ Hỗ trợ upload qua UI component `ImageUpload`
- ✅ Hỗ trợ upload qua API endpoint `/api/upload/image`

## Next Steps

1. ✅ Thiết lập Supabase Storage bucket
2. ✅ Cấu hình environment variables
3. ✅ Upload ảnh hiện có lên Supabase
4. ✅ Cập nhật database với URLs mới
5. ✅ Test upload ảnh mới qua UI
6. ✅ Verify ảnh hiển thị đúng trên website
