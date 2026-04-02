# Smart Travel Deployment Script for Windows
# Run: ./deploy.ps1

$ErrorActionPreference = "Stop"

# Config
$REGISTRY = "registry-harbor.ubos.vn"
$API_IMAGE_REF = "$REGISTRY/business-matching/api:latest"
$WEB_IMAGE_REF = "$REGISTRY/business-matching/web:latest"
$SERVER_HOST = "113.20.107.184"
$SERVER_USER = "devops"
$DEPLOY_DIR = "/home/devops/eco/project/business-matching"

Write-Host "======================================" -ForegroundColor Blue
Write-Host "   Smart Travel Deployment Script" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Build Docker image
Write-Host "[1/4] Building Docker image..." -ForegroundColor Yellow
docker compose build
Write-Host "✓ Build completed" -ForegroundColor Green
Write-Host ""

# Step 2: Push to Harbor
Write-Host "[2/4] Pushing to Harbor registry..." -ForegroundColor Yellow

function Ensure-HarborLogin-Local {
    # Nếu đã login thì pull OK. Nếu chưa, pull fail và ta mới hỏi user/pass.
    docker pull $API_IMAGE_REF *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Harbor login OK (local)" -ForegroundColor Green
        return
    }

    $script:HARBOR_USER = Read-Host "Harbor Username"
    $harborPass = Read-Host "Harbor Password" -AsSecureString
    $script:HARBOR_PASS_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($harborPass)
    )

    $script:HARBOR_PASS_PLAIN | docker login $REGISTRY -u $script:HARBOR_USER --password-stdin
}

Ensure-HarborLogin-Local
docker compose push

Write-Host "✓ Push completed" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy to server
Write-Host "[3/4] Deploying to server ($SERVER_HOST)..." -ForegroundColor Yellow

# Create deploy script content
$deployScript = @"
set -euo pipefail
API_IMAGE_REF='$API_IMAGE_REF'
WEB_IMAGE_REF='$WEB_IMAGE_REF'

# Nếu server đã login registry rồi thì không login lại.
if docker pull "\$API_IMAGE_REF" >/dev/null 2>&1; then
  echo "Harbor login OK (server)"
else
  if [ -z '${HARBOR_USER:-}' ] || [ -z '${HARBOR_PASS_PLAIN:-}' ]; then
    echo "Harbor login required on server, but credentials were not provided."
    exit 1
  fi
  echo '$HARBOR_PASS_PLAIN' | docker login registry-harbor.ubos.vn -u '$HARBOR_USER' --password-stdin
fi

cd '$DEPLOY_DIR'
docker compose --env-file .env pull
docker compose --env-file .env down
docker compose --env-file .env up -d
docker image inspect "\$API_IMAGE_REF" --format='api: {{index .RepoDigests 0}}' || true
docker image inspect "\$WEB_IMAGE_REF" --format='web: {{index .RepoDigests 0}}' || true
"@

# SSH to server (will prompt for password)
$envCmd = "HARBOR_USER=$HARBOR_USER HARBOR_PASS=$HARBOR_PASS_PLAIN DEPLOY_DIR=$DEPLOY_DIR"
$deployScript | ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$envCmd bash -s"

Write-Host "✓ Deploy completed" -ForegroundColor Green
Write-Host ""

# Step 4: Health check
Write-Host "[4/4] Checking application health..." -ForegroundColor Yellow
$healthScript = @"
curl -fsS --max-time 5 http://localhost:3001/health && echo 'API_OK' || echo 'API_FAIL'
curl -fsS --max-time 5 http://localhost:3000 && echo 'WEB_OK' || echo 'WEB_FAIL'
"@

$healthResult = ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" $healthScript 2>$null

if ($healthResult -match "API_OK") {
    Write-Host "✓ API is healthy" -ForegroundColor Green
} else {
    Write-Host "✗ API health check failed" -ForegroundColor Red
}

if ($healthResult -match "WEB_OK") {
    Write-Host "✓ Web is healthy" -ForegroundColor Green
} else {
    Write-Host "✗ Web health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   Deployment Completed!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Web: " -NoNewline
Write-Host "http://$SERVER_HOST:8011" -ForegroundColor Blue
Write-Host "API: " -NoNewline
Write-Host "http://$SERVER_HOST:8008" -ForegroundColor Blue
Write-Host ""