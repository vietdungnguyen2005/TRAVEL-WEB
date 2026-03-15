# Bootstrap — Thiết lập S3 Backend cho Terraform State

## Mục đích
Tạo S3 Bucket và DynamoDB Table để lưu trạng thái Terraform an toàn trên cloud,
thay vì lưu file `terraform.tfstate` trên máy local.

## Lợi ích
- **An toàn**: State được mã hóa (AES256) và versioned trên S3
- **Team work**: Nhiều người có thể dùng chung state mà không conflict
- **Locking**: DynamoDB ngăn 2 người chạy `terraform apply` cùng lúc

## Cách chạy (MỘT LẦN DUY NHẤT)

```powershell
cd infrastructure/bootstrap
terraform init
terraform apply
```

## Sau khi bootstrap xong

Mở file `infrastructure/backend.tf`, bỏ comment phần backend "s3", rồi chạy:

```powershell
cd infrastructure
terraform init -migrate-state
```

Terraform sẽ hỏi có muốn chuyển state từ local sang S3 không → chọn "yes".

## Tài nguyên được tạo

| Tài nguyên | Tên | Chi phí |
|---|---|---|
| S3 Bucket | `my-ai-platform-terraform-state` | ~$0.023/GB/tháng |
| DynamoDB Table | `my-ai-platform-terraform-lock` | Miễn phí (PAY_PER_REQUEST, dùng ít) |

## Lưu ý
- **KHÔNG XÓA** bucket này khi đang dùng — sẽ mất toàn bộ state
- Bucket có `prevent_destroy = true` để bảo vệ
- Versioning bật để có thể khôi phục state cũ nếu cần
