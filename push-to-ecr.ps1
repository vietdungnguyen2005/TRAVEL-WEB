<#
.SYNOPSIS
    Build Docker images and push to Amazon ECR.
.DESCRIPTION
    Authenticates with ECR, builds backend-agent and frontend-ui images,
    tags them, and pushes to the ECR repositories created by Terraform.
.PARAMETER Region
    AWS region (default: ap-southeast-1).
.PARAMETER AccountId
    AWS account ID. Auto-detected from STS if omitted.
.PARAMETER Tag
    Image tag (default: latest).
.PARAMETER BackendOnly
    Build and push only the backend-agent image.
.PARAMETER FrontendOnly
    Build and push only the frontend-ui image.
#>
param(
    [string]$Region   = "ap-southeast-1",
    [string]$AccountId = "",
    [string]$Tag       = "latest",
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

# --- Auto-detect Account ID ---
if (-not $AccountId) {
    Write-Host "[*] Detecting AWS Account ID..." -ForegroundColor Cyan
    $AccountId = (aws sts get-caller-identity --query Account --output text).Trim()
    if (-not $AccountId) {
        Write-Error "Could not detect AWS account ID. Pass -AccountId explicitly or configure AWS CLI."
        exit 1
    }
}

$ECR_BASE = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$BACKEND_REPO  = "$ECR_BASE/my-ai-platform-backend-agent"
$FRONTEND_REPO = "$ECR_BASE/my-ai-platform-frontend-ui"

# --- ECR Login ---
Write-Host "`n[1/4] Logging in to ECR ($ECR_BASE) ..." -ForegroundColor Cyan
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_BASE
if ($LASTEXITCODE -ne 0) { Write-Error "ECR login failed"; exit 1 }

# --- Build & Push Backend ---
if (-not $FrontendOnly) {
    Write-Host "`n[2/4] Building backend-agent ..." -ForegroundColor Cyan
    docker build -t my-ai-platform-backend-agent:$Tag ./backend-agent
    if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

    docker tag my-ai-platform-backend-agent:$Tag "${BACKEND_REPO}:${Tag}"
    Write-Host "      Pushing -> ${BACKEND_REPO}:${Tag}" -ForegroundColor Yellow
    docker push "${BACKEND_REPO}:${Tag}"
    if ($LASTEXITCODE -ne 0) { Write-Error "Backend push failed"; exit 1 }
    Write-Host "      Backend pushed OK" -ForegroundColor Green
}

# --- Build & Push Frontend ---
if (-not $BackendOnly) {
    Write-Host "`n[3/4] Building frontend-ui ..." -ForegroundColor Cyan
    docker build -t my-ai-platform-frontend-ui:$Tag ./frontend-ui
    if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }

    docker tag my-ai-platform-frontend-ui:$Tag "${FRONTEND_REPO}:${Tag}"
    Write-Host "      Pushing -> ${FRONTEND_REPO}:${Tag}" -ForegroundColor Yellow
    docker push "${FRONTEND_REPO}:${Tag}"
    if ($LASTEXITCODE -ne 0) { Write-Error "Frontend push failed"; exit 1 }
    Write-Host "      Frontend pushed OK" -ForegroundColor Green
}

# --- Summary ---
Write-Host "`n[4/4] Done!" -ForegroundColor Green
Write-Host "  Backend : ${BACKEND_REPO}:${Tag}"
Write-Host "  Frontend: ${FRONTEND_REPO}:${Tag}"
Write-Host ""
Write-Host "Update K8s deployment with:" -ForegroundColor Cyan
Write-Host "  kubectl set image deployment/backend-deployment backend=${BACKEND_REPO}:${Tag} -n ai-platform"
Write-Host "  kubectl set image deployment/frontend-deployment frontend=${FRONTEND_REPO}:${Tag} -n ai-platform"
