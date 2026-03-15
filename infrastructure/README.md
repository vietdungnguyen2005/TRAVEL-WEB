# Infrastructure — Phase 1: Foundation & Networking

Xây móng an toàn cho My AI Platform trên AWS.

## Cấu trúc thư mục

```
infrastructure/
├── bootstrap/              # Tạo S3 + DynamoDB cho Terraform state (chạy 1 lần)
│   ├── main.tf
│   └── README.md
├── providers.tf            # Terraform providers (AWS, Random)
├── backend.tf              # S3 backend config (bật sau khi bootstrap)
├── locals.tf               # Local values + random suffix
├── vpc.tf                  # VPC + 1 Public + 1 Private Subnet + NAT
├── security-groups.tf      # Tường lửa: ALB, Frontend, Backend, Monitoring
├── ecr.tf                  # ECR repos + lifecycle policies
├── s3.tf                   # S3 bucket cho raw documents
├── eks.tf                  # EKS cluster (Phase 2 — đang comment out)
├── variables.tf            # Tất cả biến cấu hình
├── outputs.tf              # Outputs sau khi apply
├── IAM_POLICY.json         # IAM policy template
└── SETUP_AWS_PERMISSIONS.md # Hướng dẫn setup IAM
```

## Phase 1 tạo gì?

| Tài nguyên | Mô tả | Chi phí ước tính |
|---|---|---|
| VPC | Mạng 10.0.0.0/16 với DNS support | Miễn phí |
| Public Subnet | 10.0.0.0/24 — chứa ALB, NAT Gateway | Miễn phí |
| Private Subnet | 10.0.100.0/24 — chứa Backend, Frontend | Miễn phí |
| NAT Gateway | 1 cái (single) cho private subnet ra internet | ~$45/tháng |
| Internet Gateway | Cho public subnet | Miễn phí |
| Security Groups | ALB, Backend, Frontend, Monitoring | Miễn phí |
| ECR (x2) | Docker registry cho backend-agent + frontend-ui | ~$0/tháng (dưới 500MB free) |
| S3 Bucket | Lưu tài liệu thô | ~$0.023/GB/tháng |

**Tổng Phase 1: ~$45/tháng** (chủ yếu từ NAT Gateway)

## Prerequisites

- Terraform `>= 1.5`
- AWS CLI đã cấu hình (`aws configure` hoặc environment variables)
- IAM permissions (xem `SETUP_AWS_PERMISSIONS.md`)

## Triển khai

### Bước 1: Bootstrap State Backend (chạy 1 lần)

```powershell
cd infrastructure/bootstrap
terraform init
terraform apply
```

### Bước 2: Bật S3 Backend

Mở `backend.tf`, bỏ comment phần `backend "s3"`, rồi:

```powershell
cd infrastructure
terraform init -migrate-state    # Chọn "yes" khi được hỏi
```

### Bước 3: Deploy Foundation

```powershell
terraform plan -out tfplan
terraform apply tfplan
```

## Variables

| Variable | Default | Mô tả |
|---|---|---|
| `aws_region` | `ap-southeast-1` | AWS region |
| `name` | `my-ai-platform` | Prefix cho tất cả resources |
| `vpc_cidr` | `10.0.0.0/16` | CIDR block cho VPC |
| `az_count` | `1` | Số AZ (1 = tiết kiệm, 2+ = HA cho EKS) |
| `ecr_force_delete` | `false` | Cho phép xóa ECR khi có images |
| `s3_force_destroy` | `false` | Cho phép xóa S3 khi có objects |

## Mở rộng sang Phase 2 (EKS)

```powershell
# 1. Tăng AZ lên 2 (EKS yêu cầu tối thiểu 2 AZ)
# 2. Bỏ comment module EKS trong eks.tf
# 3. Apply
terraform apply -var="az_count=2"
```

## Security Groups

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Internet   │────▶│   ALB SG     │────▶│ Frontend SG  │
│             │     │  80, 443     │     │    8501      │
└─────────────┘     └──────┬───────┘     └──────┬───────┘
                           │                     │
                           │                     ▼
                           │             ┌──────────────┐
                           └────────────▶│ Backend SG   │
                                         │    8000      │
                                         └──────────────┘
                                                │
                    ┌──────────────┐             │
                    │Monitoring SG │◀────────────┘
                    │ 9090, 3000   │  (VPC internal only)
                    └──────────────┘
```

## IAM Note

Xem `SETUP_AWS_PERMISSIONS.md` hoặc dùng `IAM_POLICY.json` để tạo policy.
Nếu gặp `AccessDenied`, dùng role có `AdministratorAccess` để bootstrap.

