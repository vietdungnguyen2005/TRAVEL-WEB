# ============================================================================
# deploy-platform.ps1 — Deploy toàn bộ Phase 3 + 4 lên EKS
# ============================================================================
# Yêu cầu: kubectl đã cấu hình (chạy configure-kubectl.ps1 trước)
# Usage:
#   .\deploy-platform.ps1              # Deploy tất cả
#   .\deploy-platform.ps1 -SkipOtel    # Bỏ qua OTel demo
#   .\deploy-platform.ps1 -DryRun      # Chỉ kiểm tra, không deploy
# ============================================================================

param(
    [switch]$SkipOtel,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path $PSScriptRoot -Parent
if ($ROOT -eq "") { $ROOT = $PSScriptRoot }

function Write-Step($num, $total, $msg) {
    Write-Host ""
    Write-Host "[$num/$total] $msg" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor DarkGray
}

function Test-ClusterReady {
    try {
        $null = kubectl cluster-info 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# ============================================
# Pre-flight checks
# ============================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  My AI Platform — Deploy Phase 3 + 4" -ForegroundColor Cyan
Write-Host "  Kafka + Flink + OpenTelemetry + Prometheus + Grafana" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$totalSteps = if ($SkipOtel) { 6 } else { 7 }

# Check tools
foreach ($tool in @("kubectl", "helm")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$tool' not found. Install it first." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-ClusterReady)) {
    Write-Host "ERROR: kubectl cannot connect to cluster." -ForegroundColor Red
    Write-Host "Run: .\configure-kubectl.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "Cluster connected." -ForegroundColor Green
kubectl get nodes --no-headers 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN — will only validate, not deploy." -ForegroundColor Magenta
}

# ============================================
# Step 1: Create Namespaces
# ============================================
Write-Step 1 $totalSteps "Creating namespaces..."

$nsFile = Join-Path $ROOT "k8s-manifests\namespaces.yaml"
if ($DryRun) {
    kubectl apply -f $nsFile --dry-run=client
} else {
    kubectl apply -f $nsFile
}

# ============================================
# Step 2: Add Helm repos
# ============================================
Write-Step 2 $totalSteps "Adding Helm repositories..."

$repos = @{
    "strimzi"              = "https://strimzi.io/charts/"
    "flink-operator"       = "https://downloads.apache.org/flink/flink-kubernetes-operator-1.9.0/"
    "prometheus-community" = "https://prometheus-community.github.io/helm-charts"
    "open-telemetry"       = "https://open-telemetry.github.io/opentelemetry-helm-charts"
}

foreach ($repo in $repos.GetEnumerator()) {
    Write-Host "  Adding $($repo.Key)..." -ForegroundColor Gray
    if (-not $DryRun) {
        helm repo add $repo.Key $repo.Value 2>&1 | Out-Null
    }
}

if (-not $DryRun) {
    Write-Host "  Updating repos..." -ForegroundColor Gray
    helm repo update 2>&1 | Out-Null
}

# ============================================
# Step 3: Deploy Strimzi Kafka Operator + Cluster
# ============================================
Write-Step 3 $totalSteps "Deploying Apache Kafka (Strimzi)..."

if (-not $DryRun) {
    # Install Strimzi Operator
    $strimziInstalled = helm list -n kafka --short 2>&1 | Select-String "strimzi"
    if (-not $strimziInstalled) {
        Write-Host "  Installing Strimzi Operator..." -ForegroundColor Gray
        helm install strimzi-operator strimzi/strimzi-kafka-operator `
            --namespace kafka `
            --version 0.43.0 `
            --wait --timeout 5m
    } else {
        Write-Host "  Strimzi Operator already installed." -ForegroundColor Gray
    }

    # Wait for CRDs
    Write-Host "  Waiting for Kafka CRDs..." -ForegroundColor Gray
    $retries = 0
    while ($retries -lt 30) {
        $crd = kubectl get crd kafkas.kafka.strimzi.io 2>&1
        if ($LASTEXITCODE -eq 0) { break }
        Start-Sleep -Seconds 5
        $retries++
    }

    # Deploy Kafka Cluster + Topics
    Write-Host "  Deploying Kafka cluster..." -ForegroundColor Gray
    kubectl apply -f (Join-Path $ROOT "k8s-manifests\kafka\kafka-cluster.yaml")

    Write-Host "  Waiting for Kafka to be ready (this may take a few minutes)..." -ForegroundColor Gray
    kubectl wait kafka/ai-platform-kafka --for=condition=Ready --timeout=600s -n kafka 2>&1
} else {
    Write-Host "  [DRY RUN] Would install Strimzi + Kafka cluster" -ForegroundColor Magenta
}

# ============================================
# Step 4: Deploy Apache Flink
# ============================================
Write-Step 4 $totalSteps "Deploying Apache Flink..."

if (-not $DryRun) {
    # Install Flink Operator
    $flinkInstalled = helm list -n flink --short 2>&1 | Select-String "flink-operator"
    if (-not $flinkInstalled) {
        Write-Host "  Installing Flink Kubernetes Operator..." -ForegroundColor Gray
        helm install flink-operator flink-operator/flink-kubernetes-operator `
            --namespace flink `
            --set webhook.create=false `
            --wait --timeout 5m
    } else {
        Write-Host "  Flink Operator already installed." -ForegroundColor Gray
    }

    # Deploy Flink cluster
    Write-Host "  Deploying Flink cluster..." -ForegroundColor Gray
    kubectl apply -f (Join-Path $ROOT "k8s-manifests\flink\flink-cluster.yaml")
} else {
    Write-Host "  [DRY RUN] Would install Flink Operator + cluster" -ForegroundColor Magenta
}

# ============================================
# Step 5: Deploy Prometheus + Grafana
# ============================================
$currentStep = 5
Write-Step $currentStep $totalSteps "Deploying Prometheus + Grafana (kube-prometheus-stack)..."

if (-not $DryRun) {
    $monInstalled = helm list -n monitoring --short 2>&1 | Select-String "monitoring"
    if (-not $monInstalled) {
        Write-Host "  Installing kube-prometheus-stack..." -ForegroundColor Gray
        helm install monitoring prometheus-community/kube-prometheus-stack `
            --namespace monitoring `
            -f (Join-Path $ROOT "k8s-manifests\monitoring\values.yaml") `
            --wait --timeout 10m
    } else {
        Write-Host "  Upgrading kube-prometheus-stack..." -ForegroundColor Gray
        helm upgrade monitoring prometheus-community/kube-prometheus-stack `
            --namespace monitoring `
            -f (Join-Path $ROOT "k8s-manifests\monitoring\values.yaml") `
            --wait --timeout 10m
    }

    # Deploy ServiceMonitors
    Write-Host "  Deploying ServiceMonitors..." -ForegroundColor Gray
    kubectl apply -f (Join-Path $ROOT "k8s-manifests\monitoring\service-monitors.yaml")
} else {
    Write-Host "  [DRY RUN] Would install kube-prometheus-stack" -ForegroundColor Magenta
}

# ============================================
# Step 6: Deploy OpenTelemetry Demo (optional)
# ============================================
$currentStep++
if (-not $SkipOtel) {
    Write-Step $currentStep $totalSteps "Deploying OpenTelemetry Demo..."

    if (-not $DryRun) {
        $otelInstalled = helm list -n otel-demo --short 2>&1 | Select-String "otel-demo"
        if (-not $otelInstalled) {
            Write-Host "  Installing OpenTelemetry Demo..." -ForegroundColor Gray
            helm install otel-demo open-telemetry/opentelemetry-demo `
                --namespace otel-demo `
                -f (Join-Path $ROOT "k8s-manifests\otel-demo\values.yaml") `
                --wait --timeout 10m
        } else {
            Write-Host "  Upgrading OpenTelemetry Demo..." -ForegroundColor Gray
            helm upgrade otel-demo open-telemetry/opentelemetry-demo `
                --namespace otel-demo `
                -f (Join-Path $ROOT "k8s-manifests\otel-demo\values.yaml") `
                --wait --timeout 10m
        }
    } else {
        Write-Host "  [DRY RUN] Would install OpenTelemetry Demo" -ForegroundColor Magenta
    }
    $currentStep++
}

# ============================================
# Final: Summary
# ============================================
Write-Step $currentStep $totalSteps "Verifying deployment..."

Write-Host ""
Write-Host "--- Kafka ---" -ForegroundColor Cyan
kubectl get kafka -n kafka 2>&1
kubectl get kafkatopic -n kafka 2>&1

Write-Host ""
Write-Host "--- Flink ---" -ForegroundColor Cyan
kubectl get flinkdeployment -n flink 2>&1

Write-Host ""
Write-Host "--- Monitoring ---" -ForegroundColor Cyan
kubectl get pods -n monitoring --no-headers 2>&1 | ForEach-Object { Write-Host "  $_" }

if (-not $SkipOtel) {
    Write-Host ""
    Write-Host "--- OpenTelemetry Demo ---" -ForegroundColor Cyan
    kubectl get pods -n otel-demo --no-headers 2>&1 | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" }
    $otelTotal = (kubectl get pods -n otel-demo --no-headers 2>&1 | Measure-Object).Count
    if ($otelTotal -gt 5) { Write-Host "  ... and $($otelTotal - 5) more pods" -ForegroundColor Gray }
}

# --- Grafana Access ---
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Grafana URL:" -ForegroundColor Cyan
$grafanaLB = kubectl get svc monitoring-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>&1
if ($grafanaLB -and $LASTEXITCODE -eq 0) {
    Write-Host "  http://$grafanaLB" -ForegroundColor Green
} else {
    Write-Host "  LoadBalancer pending... chạy lại:" -ForegroundColor Yellow
    Write-Host "  kubectl get svc monitoring-grafana -n monitoring" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Hoặc port-forward:" -ForegroundColor Yellow
    Write-Host "  kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring" -ForegroundColor Gray
    Write-Host "  -> http://localhost:3000" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  Login: admin / admin" -ForegroundColor Gray
Write-Host ""

Write-Host "Flink UI:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/ai-platform-flink-rest 8081:8081 -n flink" -ForegroundColor Gray
Write-Host "  -> http://localhost:8081" -ForegroundColor Gray
Write-Host ""

Write-Host "Kafka:" -ForegroundColor Cyan
Write-Host "  Bootstrap: ai-platform-kafka-kafka-bootstrap.kafka.svc.cluster.local:9092" -ForegroundColor Gray
Write-Host ""

if (-not $SkipOtel) {
    Write-Host "OTel Demo Webstore:" -ForegroundColor Cyan
    Write-Host "  kubectl port-forward svc/otel-demo-frontendproxy 8080:8080 -n otel-demo" -ForegroundColor Gray
    Write-Host "  -> http://localhost:8080" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Xóa khi xong:" -ForegroundColor Red
Write-Host "  .\teardown-platform.ps1" -ForegroundColor Gray
Write-Host ""
