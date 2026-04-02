#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
REGISTRY="registry-harbor.ubos.vn"
SERVER_HOST="113.20.107.184"
SERVER_USER="devops"
DEPLOY_DIR="/home/devops/eco/project/business-matching"
API_IMAGE_REF="${REGISTRY}/business-matching/api:latest"
WEB_IMAGE_REF="${REGISTRY}/business-matching/web:latest"

ensure_harbor_login_local() {
    # Nếu đã login, `docker pull` sẽ OK. Nếu chưa, nó sẽ fail và ta mới hỏi user/pass.
    if docker pull "$API_IMAGE_REF" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Harbor login OK (local)${NC}"
        return 0
    fi

    echo -e "${BLUE}Enter Harbor credentials:${NC}"
    read -p "Harbor Username: " HARBOR_USER
    read -sp "Harbor Password: " HARBOR_PASS
    echo ""

    echo "$HARBOR_PASS" | docker login "$REGISTRY" -u "$HARBOR_USER" --password-stdin
}

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Smart Travel Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Step 1: Build Docker image
echo -e "${YELLOW}[1/4] Building Docker image...${NC}"
docker compose build
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 2: Push to Harbor
echo -e "${YELLOW}[2/4] Pushing to Harbor registry...${NC}"

ensure_harbor_login_local
docker compose push

echo -e "${GREEN}✓ Push completed${NC}"
echo ""

# Step 3: Deploy to server
echo -e "${YELLOW}[3/4] Deploying to server ($SERVER_HOST)...${NC}"

echo -e "${BLUE}Enter server password for $SERVER_USER@$SERVER_HOST:${NC}"

# Use sshpass if available, otherwise prompt
if command -v sshpass &> /dev/null; then
    read -sp "Server Password: " SERVER_PASS
    echo ""
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "HARBOR_USER=$HARBOR_USER HARBOR_PASS=$HARBOR_PASS DEPLOY_DIR=$DEPLOY_DIR API_IMAGE_REF=$API_IMAGE_REF WEB_IMAGE_REF=$WEB_IMAGE_REF bash -s" <<'EOF'
set -euo pipefail

# Nếu server đã login registry rồi thì không login lại.
# Nếu chưa, `docker pull` sẽ fail và ta mới login bằng credentials được truyền vào.
if docker pull "$API_IMAGE_REF" >/dev/null 2>&1; then
  echo "Harbor login OK (server)"
else
  if [ -z "${HARBOR_USER:-}" ] || [ -z "${HARBOR_PASS:-}" ]; then
    echo "Harbor login required on server, but credentials were not provided."
    echo "Tip: export HARBOR_USER/HARBOR_PASS (or run deploy.sh once and enter credentials) then retry."
    exit 1
  fi
  echo "$HARBOR_PASS" | docker login registry-harbor.ubos.vn -u "$HARBOR_USER" --password-stdin
fi

cd "$DEPLOY_DIR"
docker compose --env-file .env pull
docker compose --env-file .env down
docker compose --env-file .env up -d
docker image inspect "$API_IMAGE_REF" --format='api: {{index .RepoDigests 0}}' || true
docker image inspect "$WEB_IMAGE_REF" --format='web: {{index .RepoDigests 0}}' || true
EOF
else
    echo -e "${YELLOW}Tip: Install 'sshpass' for automated password entry${NC}"
    echo -e "${YELLOW}    Ubuntu/Debian: sudo apt-get install sshpass${NC}"
    echo -e "${YELLOW}    macOS: brew install sshpass${NC}"
    echo ""
    
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "HARBOR_USER=$HARBOR_USER HARBOR_PASS=$HARBOR_PASS DEPLOY_DIR=$DEPLOY_DIR API_IMAGE_REF=$API_IMAGE_REF WEB_IMAGE_REF=$WEB_IMAGE_REF bash -s" <<'EOF'
set -euo pipefail

# Nếu server đã login registry rồi thì không login lại.
if docker pull "$API_IMAGE_REF" >/dev/null 2>&1; then
  echo "Harbor login OK (server)"
else
  if [ -z "${HARBOR_USER:-}" ] || [ -z "${HARBOR_PASS:-}" ]; then
    echo "Harbor login required on server, but credentials were not provided."
    echo "Tip: export HARBOR_USER/HARBOR_PASS (or run deploy.sh once and enter credentials) then retry."
    exit 1
  fi
  echo "$HARBOR_PASS" | docker login registry-harbor.ubos.vn -u "$HARBOR_USER" --password-stdin
fi

cd "$DEPLOY_DIR"
docker compose --env-file .env pull
docker compose --env-file .env down
docker compose --env-file .env up -d
docker image inspect "$API_IMAGE_REF" --format='api: {{index .RepoDigests 0}}' || true
docker image inspect "$WEB_IMAGE_REF" --format='web: {{index .RepoDigests 0}}' || true
EOF
fi

echo -e "${GREEN}✓ Deploy completed${NC}"
echo ""

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}   Deployment Completed!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "App: ${BLUE}http://$SERVER_HOST:8009${NC}"
echo ""
