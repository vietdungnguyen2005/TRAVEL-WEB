#!/usr/bin/env bash
set -euo pipefail

# Sync strategy (scheduled):
# - pg_dump from Supabase schema -> restore into local docker Postgres schema
# - This keeps local DB as a *readable mirror* for the team.
#
# Requirements:
# - SUPABASE_<SERVICE>_DATABASE_URL must include "?schema=<schema>" or otherwise point to the right schema.
# - Local docker DB containers must be running (auth-db, booking-db, ...)
#
# Notes:
# - This does NOT provide cross-db transactions.
# - This is a best-effort mirror for viewing/debugging.

SERVICES=(
  "auth"
  "booking"
  "room"
  "payment"
  "review"
  "notification"
  "blog"
)

# Map service -> env var name holding the Supabase URL
supabase_env_for() {
  local svc="$1"
  case "$svc" in
    auth) echo "AUTH_DATABASE_URL";;
    booking) echo "BOOKING_DATABASE_URL";;
    room) echo "ROOM_DATABASE_URL";;
    payment) echo "PAYMENT_DATABASE_URL";;
    review) echo "REVIEW_DATABASE_URL";;
    notification) echo "NOTIFICATION_DATABASE_URL";;
    blog) echo "BLOG_DATABASE_URL";;
    *) return 1;;
  esac
}

# Map service -> local docker container + db name
local_db_for() {
  local svc="$1"
  case "$svc" in
    auth) echo "auth-db auth_db";;
    booking) echo "booking-db booking_db";;
    room) echo "room-db room_db";;
    payment) echo "payment-db payment_db";;
    review) echo "review-db review_db";;
    notification) echo "notification-db notification_db";;
    blog) echo "blog-db blog_db";;
    *) return 1;;
  esac
}

log() {
  echo "[supabase->docker-sync] $*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd pg_dump
require_cmd psql
require_cmd docker

# Optional filter:
#   SYNC_SERVICES="auth,booking" ./supabase-to-docker.sh
if [[ -n "${SYNC_SERVICES:-}" ]]; then
  IFS="," read -r -a SERVICES <<<"${SYNC_SERVICES}"
fi

# We keep schema-only restore behavior simple: wipe local schema then restore.
# Default schema name equals the service.
for svc in "${SERVICES[@]}"; do
  env_var="$(supabase_env_for "$svc")"
  supabase_url="${!env_var:-}"

  if [[ -z "$supabase_url" ]]; then
    log "Skip $svc (missing env: $env_var)"
    continue
  fi

  read -r container local_db <<<"$(local_db_for "$svc")"
  schema="$svc"

  log "Sync $svc (schema=$schema) -> $container/$local_db"

  tmpfile="/tmp/${svc}_schema.dump"

  # Dump only the schema's content (data + schema objects inside that schema)
  # We use --schema to avoid touching other schemas.
  pg_dump "$supabase_url" \
    --format=custom \
    --no-owner \
    --no-privileges \
    --schema="$schema" \
    --file="$tmpfile"

  # Recreate schema locally and restore dump
  docker exec -i "$container" psql -U postgres -d "$local_db" <<SQL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = '${schema}') THEN
    EXECUTE 'DROP SCHEMA ${schema} CASCADE';
  END IF;
  EXECUTE 'CREATE SCHEMA ${schema}';
END$$;
SQL

  docker exec -i "$container" pg_restore -U postgres -d "$local_db" --no-owner --no-privileges "$tmpfile"

  rm -f "$tmpfile"
  log "Done $svc"
  echo
done

log "All done."
