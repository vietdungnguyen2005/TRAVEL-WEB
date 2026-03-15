# ============================================================================
# teardown-platform.ps1 — Xóa toàn bộ Phase 3 + 4 khỏi EKS
# ============================================================================
# Usage:
#   .\teardown-platform.ps1           # Xóa tất cả (có xác nhận)
#   .\teardown-platform.ps1 -Force    # Xóa không hỏi
# ============================================================================

param(
    [switch]$Force
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "  TEARDOWN — Xóa Phase 3 + 4 khỏi EKS" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "Bạn có chắc muốn xóa tất cả? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

# 1. OTel Demo
Write-Host "[1/5] Removing OpenTelemetry Demo..." -ForegroundColor Yellow
helm uninstall otel-demo -n otel-demo 2>&1 | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 2. Monitoring
Write-Host "[2/5] Removing Prometheus + Grafana..." -ForegroundColor Yellow
kubectl delete -f k8s-manifests\monitoring\service-monitors.yaml 2>&1 | Out-Null
helm uninstall monitoring -n monitoring 2>&1 | Out-Null
# Clean CRDs
kubectl delete crd prometheuses.monitoring.coreos.com 2>&1 | Out-Null
kubectl delete crd alertmanagers.monitoring.coreos.com 2>&1 | Out-Null
kubectl delete crd servicemonitors.monitoring.coreos.com 2>&1 | Out-Null
kubectl delete crd podmonitors.monitoring.coreos.com 2>&1 | Out-Null
kubectl delete crd prometheusrules.monitoring.coreos.com 2>&1 | Out-Null
kubectl delete crd thanosrulers.monitoring.coreos.com 2>&1 | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 3. Flink
Write-Host "[3/5] Removing Apache Flink..." -ForegroundColor Yellow
kubectl delete -f k8s-manifests\flink\flink-cluster.yaml 2>&1 | Out-Null
helm uninstall flink-operator -n flink 2>&1 | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 4. Kafka
Write-Host "[4/5] Removing Apache Kafka..." -ForegroundColor Yellow
kubectl delete -f k8s-manifests\kafka\kafka-cluster.yaml 2>&1 | Out-Null
helm uninstall strimzi-operator -n kafka 2>&1 | Out-Null
# Clean Strimzi CRDs
kubectl get crd -o name 2>&1 | Select-String "strimzi" | ForEach-Object { kubectl delete $_ 2>&1 | Out-Null }
Write-Host "  Done." -ForegroundColor Green

# 5. Namespaces
Write-Host "[5/5] Removing namespaces..." -ForegroundColor Yellow
foreach ($ns in @("otel-demo", "monitoring", "flink", "kafka")) {
    kubectl delete namespace $ns --timeout=120s 2>&1 | Out-Null
}
Write-Host "  Done." -ForegroundColor Green

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  TEARDOWN COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Để xóa luôn hạ tầng AWS (EKS, VPC, RDS...):" -ForegroundColor Yellow
Write-Host "  cd infrastructure; terraform destroy" -ForegroundColor Gray
Write-Host ""
