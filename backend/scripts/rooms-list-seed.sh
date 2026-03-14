#!/usr/bin/env bash
# =============================================================================
# rooms-list-seed.sh — seed the local Supabase DB with a hotel, rooms, guests, and bookings
# meant to seed the rooms list page with data
# =============================================================================
# Usage:
#   cd backend && bash scripts/rooms-list-seed.sh
#   — or —
#   make rooms-list-seed
#
# Prerequisites:
#   - Local Supabase running (make db-start)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/config/.env"
SEED_SQL="$SCRIPT_DIR/rooms-list-seed.sql"

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
echo "Done. curl commands to test GET /api/v1/rooms (set TOKEN first):"
echo ""
echo "  # All rooms:"
echo "  curl -s -H \"Authorization: Bearer \$TOKEN\" 'http://localhost:${APP_PORT}/api/v1/rooms/' | jq"
echo ""
echo "  # Floor 1 only:"
echo "  curl -s -H \"Authorization: Bearer \$TOKEN\" 'http://localhost:${APP_PORT}/api/v1/rooms/?floors=1' | jq"
echo ""
echo "  # Floors 1 and 3:"
echo "  curl -s -H \"Authorization: Bearer \$TOKEN\" 'http://localhost:${APP_PORT}/api/v1/rooms/?floors=1&floors=3' | jq"
echo ""
echo "  # Page size 3 (shows cursor pagination):"
echo "  curl -s -H \"Authorization: Bearer \$TOKEN\" 'http://localhost:${APP_PORT}/api/v1/rooms/?limit=3' | jq"
