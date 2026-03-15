# Enterprise Adaptive Hybrid AIOps Platform

Nền tảng AI Operations toàn diện trên AWS EKS, tích hợp LLM (Amazon Bedrock), RAG (Qdrant), Streaming (Kafka + Flink), Observability (Prometheus + Grafana + OpenTelemetry) và GitOps (ArgoCD).

---

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Bước 1 — Khởi tạo hạ tầng AWS (Terraform)](#bước-1--khởi-tạo-hạ-tầng-aws-terraform)
- [Bước 2 — Cấu hình kubectl](#bước-2--cấu-hình-kubectl)
- [Bước 3 — Build & Push Docker Images](#bước-3--build--push-docker-images)
- [Bước 4 — Deploy Workloads lên EKS](#bước-4--deploy-workloads-lên-eks)
- [Bước 5 — Xác minh hệ thống](#bước-5--xác-minh-hệ-thống)
- [Data Flow Verification](#data-flow-verification)
- [Dừng & Xóa hạ tầng](#dừng--xóa-hạ-tầng)
- [Chi phí ước tính](#chi-phí-ước-tính)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)

---

## Yêu cầu hệ thống

| Tool | Version | Cài đặt |
|------|---------|---------|
| AWS CLI | >= 2.x | `winget install Amazon.AWSCLI` |
| Terraform | >= 1.5 | `winget install Hashicorp.Terraform` |
| kubectl | >= 1.28 | `choco install kubernetes-cli` |
| Helm | >= 3.12 | `choco install kubernetes-helm` |
| Docker | >= 24.x | Docker Desktop |
| Python | >= 3.11 | `winget install Python.Python.3.11` |

**AWS Credentials** phải được cấu hình trước:

```powershell
aws configure
# AWS Access Key ID:     <your-key>
# AWS Secret Access Key: <your-secret>
# Default region:        ap-southeast-1
# Default output:        json

# Kiểm tra:
aws sts get-caller-identity
```

---

## Kiến trúc tổng quan

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  AWS VPC (10.0.0.0/16)                                  │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  Public       │    │  Private Subnets              │   │
│  │  Subnets      │    │                              │   │
│  │  ┌──────┐     │    │  ┌─────────────────────┐     │   │
│  │  │ NAT  │     │    │  │  EKS Cluster (1.30)  │     │   │
│  │  │ GW   │     │    │  │                     │     │   │
│  │  └──────┘     │    │  │  ┌─────────────┐    │     │   │
│  │  ┌──────┐     │    │  │  │ Nginx       │    │     │   │
│  │  │ NLB  │◄────┼────┼──│  │ Ingress     │    │     │   │
│  │  └──────┘     │    │  │  └──────┬──────┘    │     │   │
│  └──────────────┘    │  │         │           │     │   │
│                       │  │    ┌────┴────┐      │     │   │
│                       │  │    ▼         ▼      │     │   │
│                       │  │ Backend   Frontend  │     │   │
│                       │  │ (FastAPI) (Streamlit)│     │   │
│                       │  │    │                │     │   │
│                       │  │    ├── Kafka (Strimzi)    │   │
│                       │  │    ├── Flink              │   │
│                       │  │    ├── Prometheus+Grafana  │   │
│                       │  │    ├── OTel Demo           │   │
│                       │  │    └── ArgoCD              │   │
│                       │  └─────────────────────┘     │   │
│                       │                              │   │
│                       │  ┌─────────────┐             │   │
│                       │  │ RDS Postgres │             │   │
│                       │  │ (Private)    │             │   │
│                       │  └─────────────┘             │   │
│                       └──────────────────────────────┘   │
│                                                         │
│  VPC Endpoints: Bedrock Runtime, S3                     │
└─────────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  Amazon Bedrock            Qdrant Cloud
  (Llama-3, Titan)          (Vector DB)
```

---

## Bước 1 — Khởi tạo hạ tầng AWS (Terraform)

### 1.1 Bootstrap S3 Backend (chạy 1 lần duy nhất)

```powershell
cd infrastructure/bootstrap
terraform init
terraform apply -auto-approve
cd ..
```

Sau khi bootstrap xong, bỏ comment block `backend "s3"` trong `infrastructure/backend.tf` rồi chạy lại `terraform init` để migrate state sang S3.

### 1.2 Tạo file tfvars

```powershell
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Chỉnh sửa terraform.tfvars theo nhu cầu (instance type, node count, RDS password...)
```

### 1.3 Plan & Apply

```powershell
cd infrastructure

# Xem trước thay đổi:
terraform plan -out=tfplan

# Áp dụng (tạo toàn bộ hạ tầng AWS):
terraform apply tfplan
```

> **Thời gian:** EKS cluster mất ~15-20 phút, RDS ~5-10 phút.

### 1.4 Kiểm tra hạ tầng đã tạo

```powershell
# EKS
aws eks describe-cluster --name my-ai-platform-eks --query "cluster.status"

# RDS
aws rds describe-db-instances --query "DBInstances[?DBInstanceIdentifier=='my-ai-platform-postgres'].DBInstanceStatus"

# VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*my-ai-platform*" --query "Vpcs[].VpcId"

# ECR
aws ecr describe-repositories --query "repositories[].repositoryName"
```

---

## Bước 2 — Cấu hình kubectl

```powershell
# Script tự động:
.\configure-kubectl.ps1

# Hoặc manual:
aws eks update-kubeconfig --name my-ai-platform-eks --region ap-southeast-1

# Kiểm tra kết nối:
kubectl get nodes
kubectl cluster-info
```

---

## Bước 3 — Build & Push Docker Images

```powershell
# Push cả backend + frontend:
.\push-to-ecr.ps1

# Chỉ backend:
.\push-to-ecr.ps1 -BackendOnly

# Chỉ frontend:
.\push-to-ecr.ps1 -FrontendOnly

# Với tag cụ thể:
.\push-to-ecr.ps1 -Tag "v1.0.0"
```

---

## Bước 4 — Deploy Workloads lên EKS

### 4.1 Deploy tự động (khuyến nghị)

```powershell
# Deploy tất cả: Kafka, Flink, Prometheus, Grafana, OTel Demo
.\deploy-platform.ps1

# Bỏ qua OTel Demo (tiết kiệm resource):
.\deploy-platform.ps1 -SkipOtel

# Dry run (chỉ kiểm tra, không deploy):
.\deploy-platform.ps1 -DryRun
```

### 4.2 Deploy AI Agent + Frontend

```powershell
# Tạo secrets (thay bằng giá trị thực sau base64 encode):
kubectl apply -f k8s-manifests/ai-platform/secrets.yaml

# Tạo service account (IRSA cho Bedrock):
kubectl apply -f k8s-manifests/ai-platform/service-account.yaml

# Deploy backend + frontend:
kubectl apply -f k8s-manifests/deployment.yaml

# Deploy ingress routing:
kubectl apply -f k8s-manifests/ai-platform/ingress.yaml

# Deploy network policies:
kubectl apply -f k8s-manifests/network-policy.yaml
```

### 4.3 Kiểm tra pods

```powershell
# Tất cả pods trên mọi namespace:
kubectl get pods -A

# Chỉ AI Platform:
kubectl get pods -n ai-platform

# Kafka:
kubectl get pods -n kafka

# Monitoring:
kubectl get pods -n monitoring
```

---

## Bước 5 — Xác minh hệ thống

```powershell
# Backend health check:
kubectl port-forward svc/backend-service 8080:80 -n ai-platform
# Mở browser: http://localhost:8080/health

# Grafana dashboard:
kubectl get svc -n monitoring | Select-String grafana
# Truy cập qua NLB external IP, mật khẩu mặc định: admin / admin

# ArgoCD:
kubectl port-forward svc/argocd-server 8443:443 -n argocd
# Mở browser: https://localhost:8443
# Lấy password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## Data Flow Verification

Sơ đồ luồng dữ liệu của platform và cách kiểm tra từng đoạn:

### Luồng 1: User Request → AI Response

```
User ──► Nginx Ingress ──► Frontend (Streamlit) ──► Backend (FastAPI)
                                                        │
                                                        ├──► Amazon Bedrock (LLM: Llama-3)
                                                        ├──► Qdrant Cloud  (RAG: Vector Search)
                                                        └──► RDS Postgres  (Chat History)
```

**Kiểm tra:**

```powershell
# 1. Backend API hoạt động:
kubectl exec -it deploy/backend-deployment -n ai-platform -- curl -s http://localhost:80/health
# Expected: {"status": "healthy", "qdrant": "connected", "rds": "connected"}

# 2. Chat endpoint:
kubectl exec -it deploy/backend-deployment -n ai-platform -- curl -s -X POST http://localhost:80/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
# Expected: AI response from Bedrock

# 3. Qdrant connectivity:
kubectl exec -it deploy/backend-deployment -n ai-platform -- python -c "
from qdrant_client import QdrantClient
import os
client = QdrantClient(url=os.environ['QDRANT_URL'], api_key=os.environ['QDRANT_API_KEY'])
print('Collections:', client.get_collections())
"
```

### Luồng 2: Telemetry & Observability

```
OTel Demo (15 microservices)
    │
    ▼
OTel Collector ──► Kafka Topics (otel-traces, otel-metrics)
    │                    │
    ▼                    ▼
Jaeger (Traces)    Flink (Stream Processing)
    │                    │
    └────────┬───────────┘
             ▼
    Prometheus (Metrics Store)
             │
             ▼
    Grafana (Dashboards)
```

**Kiểm tra:**

```powershell
# 1. Kafka topics có dữ liệu:
kubectl exec -it ai-platform-kafka-0 -n kafka -- \
  bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
# Expected: app-logs, otel-traces, otel-metrics, processed-events

# 2. Kafka consumer kiểm tra messages:
kubectl exec -it ai-platform-kafka-0 -n kafka -- \
  bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic otel-traces --max-messages 5 --from-beginning

# 3. Prometheus targets:
kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090 -n monitoring
# Mở browser: http://localhost:9090/targets
# Kiểm tra tất cả targets đều UP

# 4. Grafana dashboards:
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Mở browser: http://localhost:3000
# Login: admin / admin
# Kiểm tra dashboards: AI Platform Overview, Kafka, Flink

# 5. Flink jobs:
kubectl port-forward svc/flink-cluster-rest 8081:8081 -n flink
# Mở browser: http://localhost:8081
```

### Luồng 3: Document Embedding (RAG Pipeline)

```
S3 Bucket (raw docs) ──► embed_documents.py ──► Bedrock Titan Embed ──► Qdrant Cloud
```

**Kiểm tra:**

```powershell
# 1. Upload sample document:
aws s3 cp docs/sample-policy.txt s3://<your-bucket-name>/documents/

# 2. Chạy embedding:
cd backend-agent
python embed_documents.py --source s3 --bucket <your-bucket-name> --prefix documents/
# Expected: "Embedded X chunks into Qdrant collection"

# 3. Verify trong Qdrant:
python -c "
from qdrant_client import QdrantClient
client = QdrantClient(url='https://02fbd500-006b-4c7c-8487-3e173ce0563f.eu-central-1-0.aws.cloud.qdrant.io')
info = client.get_collection('ai-platform-docs')
print(f'Points: {info.points_count}, Vectors: {info.vectors_count}')
"
```

### Luồng 4: GitOps (ArgoCD)

```
Git Repo (push) ──► ArgoCD (detect) ──► Auto-Sync ──► EKS (apply manifests)
```

**Kiểm tra:**

```powershell
# 1. ArgoCD application status:
kubectl get applications -n argocd
# Expected: STATUS=Synced, HEALTH=Healthy

# 2. Chi tiết sync:
kubectl describe application ai-platform-app -n argocd

# 3. ArgoCD UI:
kubectl port-forward svc/argocd-server 8443:443 -n argocd
# Mở browser: https://localhost:8443
```

---

## Dừng & Xóa hạ tầng

### Xóa workloads K8s (giữ lại hạ tầng AWS)

```powershell
# Xóa Phase 3+4 (Kafka, Flink, Monitoring, OTel):
.\teardown-platform.ps1

# Xóa không cần xác nhận:
.\teardown-platform.ps1 -Force
```

### Xóa AI Agent workloads

```powershell
kubectl delete -f k8s-manifests/ai-platform/ingress.yaml
kubectl delete -f k8s-manifests/deployment.yaml
kubectl delete -f k8s-manifests/ai-platform/service-account.yaml
kubectl delete -f k8s-manifests/ai-platform/secrets.yaml
kubectl delete -f k8s-manifests/network-policy.yaml
```

### Xóa TOÀN BỘ hạ tầng AWS (EKS, VPC, RDS, ECR, S3...)

```powershell
cd infrastructure

# Xem trước những gì sẽ bị xóa:
terraform plan -destroy

# Xóa (cần xác nhận "yes"):
terraform destroy
```

> **⚠️ Cảnh báo:** `terraform destroy` sẽ xóa TOÀN BỘ: EKS cluster, RDS database, VPC, NAT Gateway, Load Balancers, ECR repos, S3 bucket, VPC Endpoints. Hành động này KHÔNG THỂ hoàn tác.

### Xóa S3 State Backend (nếu muốn xóa sạch hoàn toàn)

```powershell
cd infrastructure/bootstrap
terraform destroy -auto-approve
```

---

## Chi phí ước tính

| Resource | Cấu hình | Chi phí/tháng (USD) |
|----------|----------|---------------------|
| EKS Control Plane | 1 cluster | ~$73 |
| EC2 Worker Nodes | 1-3x t3.medium (ON_DEMAND) | ~$30-90 |
| NAT Gateway | 1 (single AZ) | ~$32 |
| RDS PostgreSQL | db.t4g.micro, 20GB gp3 | ~$12 |
| VPC Endpoint (Bedrock) | 2 AZ Interface | ~$14 |
| ECR | 2 repos | ~$1 |
| S3 | Documents bucket | < $1 |
| Qdrant Cloud | Free tier | $0 |
| **Tổng ước tính** | **Dev/Test config** | **~$160-220** |

> Sử dụng SPOT instances (`node_capacity_type = "SPOT"` trong tfvars) để giảm ~60-70% chi phí EC2.

---

## Cấu trúc thư mục

```
my-ai-platform/
├── infrastructure/           # Terraform IaC (15 files)
│   ├── providers.tf          # AWS + Helm + Kubernetes providers
│   ├── backend.tf            # S3 state backend (commented)
│   ├── locals.tf             # Local values
│   ├── vpc.tf                # VPC, Subnets, NAT Gateway
│   ├── security-groups.tf    # 5 Security Groups
│   ├── ecr.tf                # ECR repositories
│   ├── s3.tf                 # S3 document bucket
│   ├── eks.tf                # EKS cluster + node groups
│   ├── rds.tf                # RDS PostgreSQL
│   ├── bedrock.tf            # Bedrock IRSA + VPC Endpoints
│   ├── argocd.tf             # ArgoCD Helm + Application
│   ├── alb-controller.tf     # AWS Load Balancer Controller
│   ├── nginx-ingress.tf      # Nginx Ingress Controller
│   ├── variables.tf          # All variables
│   ├── outputs.tf            # All outputs
│   └── bootstrap/            # S3 backend bootstrap
│
├── k8s-manifests/            # Kubernetes manifests
│   ├── namespaces.yaml       # 5 namespaces
│   ├── deployment.yaml       # Backend + Frontend deployments
│   ├── network-policy.yaml   # Network policies
│   ├── nginx-ingress.yaml    # Nginx proxy (legacy)
│   ├── ai-platform/          # AI Agent resources
│   │   ├── secrets.yaml
│   │   ├── service-account.yaml
│   │   └── ingress.yaml
│   ├── kafka/
│   │   └── kafka-cluster.yaml
│   ├── flink/
│   │   └── flink-cluster.yaml
│   ├── otel-demo/
│   │   └── values.yaml
│   └── monitoring/
│       ├── values.yaml
│       └── service-monitors.yaml
│
├── backend-agent/            # FastAPI AI Agent (Python)
│   ├── main.py               # LangGraph ReAct + Bedrock + Qdrant + Kafka
│   ├── embed_documents.py    # Document embedding pipeline
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend-ui/              # Streamlit Frontend (Python)
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── monitoring/               # Grafana dashboards + Prometheus config
│
├── deploy-platform.ps1       # Deploy Phase 3+4 (Kafka, Flink, Monitoring, OTel)
├── teardown-platform.ps1     # Reverse teardown Phase 3+4
├── configure-kubectl.ps1     # Cấu hình kubectl → EKS
├── push-to-ecr.ps1           # Build & push Docker images → ECR
└── README.md                 # ← Bạn đang đọc file này
```

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| `terraform apply` lỗi timeout | EKS mất 15-20p, chạy lại `terraform apply` |
| kubectl không kết nối | Chạy `.\configure-kubectl.ps1` hoặc `aws eks update-kubeconfig` |
| Pod CrashLoopBackOff | `kubectl logs <pod> -n <ns>` để xem lỗi |
| Bedrock access denied | Kiểm tra IRSA role và model access trong Bedrock console |
| Qdrant connection refused | Kiểm tra secret `qdrant-credentials` và network policy egress |
| Kafka broker not ready | Chờ 3-5p sau khi deploy, check `kubectl get kafka -n kafka` |
| Grafana không có data | Kiểm tra Prometheus targets: `http://localhost:9090/targets` |
