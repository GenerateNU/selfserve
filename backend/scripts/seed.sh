#!/usr/bin/env bash
# =============================================================================
# seed.sh — seed the local Supabase DB with a hotel, rooms, guests, and bookings
# =============================================================================
# Usage:
#   cd backend && bash scripts/seed.sh
#   — or —
#   make seed
#
# Prerequisites:
#   - Local Supabase running (make db-start)
#
# Note: supabase/seed.sql is also run automatically by `supabase db reset`.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/config/.env"
SEED_SQL="$BACKEND_DIR/supabase/seed.sql"

# Load .env
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
APP_PORT="${APP_PORT:-8080}"

echo "Seeding database at ${DB_HOST}:${DB_PORT}/${DB_NAME}..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEED_SQL"
echo ""
echo "Done. curl commands to test:"
echo ""
echo "  export HOTEL_ID='a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'"
echo ""
echo "  # All rooms:"
echo "  curl -s -X POST -H \"Content-Type: application/json\" -H \"X-Hotel-ID: \$HOTEL_ID\" -d '{}' 'http://localhost:${APP_PORT}/api/v1/rooms' | jq"
echo ""
echo "  # Floor 1 only:"
echo "  curl -s -X POST -H \"Content-Type: application/json\" -H \"X-Hotel-ID: \$HOTEL_ID\" -d '{\"floors\":[1]}' 'http://localhost:${APP_PORT}/api/v1/rooms' | jq"
echo ""
echo "  # All guests:"
echo "  curl -s -H \"X-Hotel-ID: \$HOTEL_ID\" 'http://localhost:${APP_PORT}/api/v1/guests' | jq"
echo ""
echo "  # Requests for room 102:"
echo "  curl -s -X POST -H \"Content-Type: application/json\" -H \"X-Hotel-ID: \$HOTEL_ID\" -d '{\"room_id\":\"10000000-0000-0000-0000-000000000102\"}' 'http://localhost:${APP_PORT}/api/v1/requests/room' | jq"
