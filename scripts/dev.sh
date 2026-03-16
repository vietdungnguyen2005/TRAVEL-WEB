#!/usr/bin/env bash
###############################################################################
# dev.sh  –  One-command local dev for TRAVEL-WEB
#
# DB on Supabase (remote). RabbitMQ via Docker (local).
#
# Usage:
#   bash scripts/dev.sh          # start full stack
#   bash scripts/dev.sh --stop   # kill all services + stop RabbitMQ
###############################################################################
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.local.yml"

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERR]${NC}   $*"; }

PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 4000)

# ── kill service ports (cross-platform via Node) ────────────────────────────
kill_ports() {
  node "$ROOT_DIR/scripts/kill-ports.js" || true
}

# ── handle --stop ────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--stop" ]]; then
  info "Stopping all services..."
  kill_ports
  info "Stopping RabbitMQ container..."
  docker compose -f "$COMPOSE_FILE" stop rabbitmq 2>/dev/null || true
  ok "All services stopped."
  exit 0
fi

# ── 1. Ports already cleared by npm predev:start (kill-ports.js) ─────────────
ok "Ports clear"

# ── 2. Start RabbitMQ via Docker ─────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  err "Docker not found. RabbitMQ requires Docker."
  exit 1
fi

info "Starting RabbitMQ (Docker)..."
docker compose -f "$COMPOSE_FILE" up -d rabbitmq

# Wait for RabbitMQ to be ready
info "Waiting for RabbitMQ..."
retries=60
while ! docker exec tw-rabbitmq rabbitmq-diagnostics -q ping 2>/dev/null; do
  retries=$((retries - 1))
  if [ $retries -le 0 ]; then
    err "RabbitMQ did not become ready in time"
    exit 1
  fi
  printf "."
  sleep 2
done
echo ""
ok "RabbitMQ ready (amqp://localhost:5672)"

# ── 3. Quick sanity checks ──────────────────────────────────────────────────
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  info "Running npm install..."
  cd "$ROOT_DIR" && npm install --legacy-peer-deps
fi

# ── 4. Build shared packages (if dist/ missing) ─────────────────────────────
if [ ! -d "$ROOT_DIR/packages/shared/dist" ] || [ ! -d "$ROOT_DIR/packages/contracts/dist" ]; then
  info "Building shared packages..."
  cd "$ROOT_DIR" && npx turbo run build --filter=@travel-web/shared --filter=@travel-web/contracts 2>&1 | tail -3
  ok "Shared packages built"
fi

# ── 5. Start everything ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  TRAVEL-WEB Local Dev Stack${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Web (Next.js)      : http://localhost:3000"
echo "  API Gateway        : http://localhost:4000"
echo "  Auth Service       : http://localhost:3001"
echo "  Booking Service    : http://localhost:3002"
echo "  Room Service       : http://localhost:3003"
echo "  Payment Service    : http://localhost:3004"
echo "  Review Service     : http://localhost:3005"
echo "  Notification Svc   : http://localhost:3006"
echo "  Content Service    : http://localhost:3007"
echo "  Blog Service       : http://localhost:3008"
echo ""
echo -e "  DB:       ${CYAN}Supabase${NC} (remote)"
echo -e "  RabbitMQ: ${CYAN}Docker${NC}   (localhost:5672, UI: http://localhost:15672)"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all services${NC}"
echo ""

cd "$ROOT_DIR"
exec npx turbo run dev \
  --filter=web \
  --filter=api-gateway \
  --filter=@travel-web/auth-service \
  --filter=room-service \
  --filter=content-service \
  --filter=blog-service \
  --filter=booking-service \
  --filter=payment-service \
  --filter=review-service \
  --filter=notification-service \
  --filter=@travel-web/shared \
  --filter=@travel-web/contracts \
  --concurrency=12
