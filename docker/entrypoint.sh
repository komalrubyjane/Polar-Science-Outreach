#!/bin/sh
set -e

echo "→ Running database migrations (prisma migrate deploy)…"
if node_modules/.bin/prisma migrate deploy 2>/dev/null; then
  echo "  migrations applied"
else
  echo "  no migration history found — falling back to 'prisma db push'"
  node_modules/.bin/prisma db push --skip-generate
fi

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "→ Seeding database (SEED_ON_START=true)…"
  node_modules/.bin/tsx prisma/seed.ts || echo "  seed skipped/failed (continuing)"
fi

echo "→ Starting Next.js server"
exec "$@"
