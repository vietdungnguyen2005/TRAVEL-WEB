# Hướng dẫn cấu hình quyền AWS cho Terraform

## Vấn đề hiện tại

IAM user `devops-infra` (được dùng bởi cả profile `default` và `dev`) không có quyền tạo infrastructure (VPC, EKS, ECR, S3, IAM roles, CloudWatch Logs, KMS).

## Giải pháp

### Option 1: Nhanh nhất (Temporary - Development/Testing)

Attach managed policy **AdministratorAccess** vào IAM user `devops-infra`:

1. Vào [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Chọn **Users** → tìm user `devops-infra`
3. Tab **Permissions** → click **Add permissions** → **Attach policies directly**
4. Tìm và chọn `AdministratorAccess`
5. Click **Add permissions**

Sau đó chạy lại:
```powershell
cd d:\my-ai-platform\infrastructure
$env:AWS_PROFILE="dev"
terraform plan -out tfplan
terraform apply -auto-approve tfplan
```

### Option 2: Best Practice (Production)

Tạo một custom IAM policy với quyền tối thiểu cần thiết:

1. Vào [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Chọn **Policies** → **Create policy**
3. Tab **JSON** → paste nội dung từ file `IAM_POLICY.json` trong thư mục này
4. Click **Next** → đặt tên policy: `TerraformInfrastructurePolicy`
5. Click **Create policy**

Sau đó attach policy này vào user `devops-infra`:
1. **Users** → `devops-infra`
2. **Permissions** → **Add permissions** → **Attach policies directly**
3. Tìm và chọn `TerraformInfrastructurePolicy`
4. Click **Add permissions**

### Option 3: Dùng IAM Role (Most Secure)

Tạo một IAM role chuyên dụng cho Terraform và assume role đó:

1. Tạo IAM role `TerraformExecutionRole` với trust policy cho user `devops-infra`
2. Attach policy `TerraformInfrastructurePolicy` (từ Option 2) vào role
3. Cấu hình AWS profile để assume role:

Edit `~/.aws/config`:
```ini
[profile terraform]
role_arn = arn:aws:iam::443014729163:role/TerraformExecutionRole
source_profile = dev
region = ap-southeast-1
```

Sau đó chạy:
```powershell
cd d:\my-ai-platform\infrastructure
$env:AWS_PROFILE="terraform"
terraform plan -out tfplan
terraform apply -auto-approve tfplan
```

## Kiểm tra quyền hiện tại

Để xem user hiện tại có quyền gì:
```powershell
$env:AWS_PROFILE="dev"
aws iam list-attached-user-policies --user-name devops-infra
aws iam list-user-policies --user-name devops-infra
```

## Sau khi cấp quyền

```powershell
cd d:\my-ai-platform\infrastructure
$env:AWS_PROFILE="dev"  # hoặc "terraform" nếu dùng Option 3
terraform plan -out tfplan
terraform apply -auto-approve tfplan
```

## Lưu ý bảo mật

- **Option 1** (AdministratorAccess) chỉ nên dùng tạm thời trong môi trường dev/test
- **Option 2** (custom policy) phù hợp cho production nhưng vẫn là user credentials
- **Option 3** (IAM role) là best practice: có audit trail, có thể revoke dễ dàng, giới hạn thời gian session

Sau khi infrastructure đã tạo xong, nên:
1. Tạo một Terraform execution role riêng
2. Lưu Terraform state vào S3 backend
3. Chỉ cho phép role đó access S3 state bucket
4. Revoke quyền không cần thiết khỏi user `devops-infra`
