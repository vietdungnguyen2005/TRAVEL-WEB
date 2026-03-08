#!/usr/bin/env bash
###############################################################################
# start-local.sh  –  One-command local dev for TRAVEL-WEB
#
# Stack:  Web (Next.js) + API Gateway + Room/Content/Blog services
#         + all required infrastructure (Postgres, Redis, RabbitMQ)
#
# Usage:
#   bash scripts/start-local.sh           # start everything
#   bash scripts/start-local.sh --infra   # only infrastructure (DBs, Redis, RabbitMQ)
#   bash scripts/start-local.sh --stop    # stop all infrastructure
#
# Prerequisites:
#   - Docker & docker compose (v2)
#   - Node.js >= 20, npm >= 10
#   - npm install already done at repo root
###############################################################################
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.local.yml"

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERR]${NC}   $*"; }

# ── handle --stop ────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--stop" ]]; then
  info "Stopping infrastructure containers..."
  docker compose -f "$COMPOSE_FILE" down
  ok "Infrastructure stopped."
  exit 0
fi

# ── 1. Start infrastructure via Docker Compose ──────────────────────────────
info "Starting infrastructure (Postgres, Redis, RabbitMQ)..."
docker compose -f "$COMPOSE_FILE" up -d

# ── 2. Wait for databases to be ready ────────────────────────────────────────
wait_pg() {
  local name=$1 port=$2
  local retries=30
  info "Waiting for $name (port $port)..."
  while ! docker compose -f "$COMPOSE_FILE" exec -T "$name" pg_isready -U postgres -q 2>/dev/null; do
    retries=$((retries - 1))
    if [ $retries -le 0 ]; then
      error "$name did not become ready in time"
      exit 1
    fi
    sleep 1
  done
  ok "$name ready"
}

wait_pg auth-db      5432
wait_pg room-db      5432
wait_pg content-db   5432
wait_pg blog-db      5432
wait_pg booking-db   5432
wait_pg payment-db   5432

# ── 3. Create schemas that services expect (multiSchema prisma) ──────────────
info "Ensuring Postgres schemas exist..."

create_schema() {
  local container=$1 schema=$2
  docker compose -f "$COMPOSE_FILE" exec -T "$container" \
    psql -U postgres -d postgres -c "CREATE SCHEMA IF NOT EXISTS \"$schema\";" 2>/dev/null || true
}

# content-service uses schema "content", blog uses "blog"
# auth/room/booking etc use "public" by default
create_schema content-db content
create_schema blog-db    blog

ok "Schemas ready"

# ── 4. Run Prisma migrations (generate + deploy) ─────────────────────────────
info "Running Prisma generate & migrate for local services..."

run_prisma() {
  local svc=$1
  local svc_dir="$ROOT_DIR/services/$svc"
  if [ -f "$svc_dir/prisma/schema.prisma" ]; then
    info "  Prisma: $svc"
    (cd "$svc_dir" && npx prisma generate 2>/dev/null && npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null) && ok "  $svc migrated" || warn "  $svc migration skipped (may need manual migrate dev)"
  fi
}

run_prisma auth-service
run_prisma room-service
run_prisma content-service
run_prisma blog-service
run_prisma booking-service
run_prisma payment-service
run_prisma notification-service
run_prisma review-service

# ── 5. Exit early if --infra only ────────────────────────────────────────────
if [[ "${1:-}" == "--infra" ]]; then
  ok "Infrastructure is up. Start services manually with: npm run dev"
  echo ""
  echo "Port map:"
  echo "  PostgreSQL auth    : localhost:5438"
  echo "  PostgreSQL booking : localhost:5433"
  echo "  PostgreSQL room    : localhost:5434"
  echo "  PostgreSQL content : localhost:5439"
  echo "  PostgreSQL blog    : localhost:5440"
  echo "  PostgreSQL payment : localhost:5435"
  echo "  Redis              : localhost:6380"
  echo "  RabbitMQ           : localhost:5672 (UI: 15672)"
  exit 0
fi

# ── 6. Start services via Turbo (parallel, with filter) ──────────────────────
info "Starting services: web + gateway + room + content + blog + auth..."
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  TRAVEL-WEB Local Dev Stack${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Web (Next.js)      : http://localhost:3000"
echo "  API Gateway        : http://localhost:4000"
echo "  Auth Service       : http://localhost:3001"
echo "  Room Service       : http://localhost:3003"
echo "  Content Service    : http://localhost:3007"
echo "  Blog Service       : http://localhost:3008"
echo "  Booking Service    : http://localhost:3002"
echo "  Payment Service    : http://localhost:3004"
echo ""
echo "  RabbitMQ UI        : http://localhost:15672 (guest/guest)"
echo "  Redis              : localhost:6380"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all services${NC}"
echo ""

# Run turbo dev for the selected workspaces
cd "$ROOT_DIR"
npx turbo run dev \
  --filter=web \
  --filter=api-gateway \
  --filter=@travel-web/auth-service \
  --filter=room-service \
  --filter=content-service \
  --filter=blog-service \
  --filter=booking-service \
  --filter=payment-service \
  --filter=@travel-web/shared \
  --filter=@travel-web/contracts \
  --concurrency=12
