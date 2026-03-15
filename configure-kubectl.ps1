# ============================================================================
# configure-kubectl.ps1 — Cấu hình kubectl kết nối tới EKS Cluster
# ============================================================================
# Chạy script này sau khi terraform apply thành công:
#   .\configure-kubectl.ps1
# ============================================================================

param(
    [string]$Region = "ap-southeast-1",
    [string]$ClusterName = "my-ai-platform-eks"
)

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Cấu hình kubectl cho EKS Cluster" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Kiểm tra tools ---
Write-Host "[1/4] Kiểm tra tools cần thiết..." -ForegroundColor Yellow

$missingTools = @()
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { $missingTools += "aws" }
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) { $missingTools += "kubectl" }
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) { $missingTools += "terraform" }

if ($missingTools.Count -gt 0) {
    Write-Host "  THIẾU: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host ""
    if ($missingTools -contains "aws") {
        Write-Host "  Cài AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" -ForegroundColor Gray
    }
    if ($missingTools -contains "kubectl") {
        Write-Host "  Cài kubectl:  https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/" -ForegroundColor Gray
        Write-Host "  Hoặc:         choco install kubernetes-cli" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "  OK: aws, kubectl, terraform" -ForegroundColor Green

# --- 2. Kiểm tra AWS credentials ---
Write-Host "[2/4] Kiểm tra AWS credentials..." -ForegroundColor Yellow

try {
    $callerIdentity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
    Write-Host "  Account: $($callerIdentity.Account)" -ForegroundColor Green
    Write-Host "  User:    $($callerIdentity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "  Chưa cấu hình AWS credentials!" -ForegroundColor Red
    Write-Host "  Chạy: aws configure" -ForegroundColor Gray
    exit 1
}

# --- 3. Lấy thông tin từ Terraform output (nếu có) ---
Write-Host "[3/4] Lấy cluster info..." -ForegroundColor Yellow

$tfDir = Join-Path $PSScriptRoot "infrastructure"
if (Test-Path (Join-Path $tfDir "terraform.tfstate")) {
    try {
        Push-Location $tfDir
        $clusterNameFromTf = (terraform output -raw eks_cluster_name 2>$null)
        if ($clusterNameFromTf) {
            $ClusterName = $clusterNameFromTf
            Write-Host "  Cluster (from terraform output): $ClusterName" -ForegroundColor Green
        }
        Pop-Location
    } catch {
        Pop-Location
        Write-Host "  Dùng default: $ClusterName" -ForegroundColor Gray
    }
} else {
    Write-Host "  Dùng parameter: $ClusterName" -ForegroundColor Gray
}

# --- 4. Update kubeconfig ---
Write-Host "[4/4] Cập nhật kubeconfig..." -ForegroundColor Yellow

aws eks update-kubeconfig --region $Region --name $ClusterName 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Lỗi cập nhật kubeconfig!" -ForegroundColor Red
    Write-Host "  Kiểm tra cluster name và region có đúng không." -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " kubectl đã sẵn sàng!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# --- Verify ---
Write-Host "Kiểm tra kết nối:" -ForegroundColor Cyan
Write-Host ""

kubectl cluster-info 2>&1
Write-Host ""

kubectl get nodes 2>&1
Write-Host ""

Write-Host "--- Lệnh hữu ích ---" -ForegroundColor Cyan
Write-Host "  kubectl get pods -A              # Xem tất cả pods"
Write-Host "  kubectl get svc -A               # Xem tất cả services"
Write-Host "  kubectl get nodes -o wide        # Xem worker nodes chi tiết"
Write-Host "  kubectl top nodes                # CPU/RAM usage"
Write-Host ""
