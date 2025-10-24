#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +'%Y%m%d-%H%M%S')"
OUT="data/jobby-$STAMP.sql"

mkdir -p data

docker exec jobby-backend sh -c 'apk add --no-cache sqlite' >/dev/null 2>&1 || true
docker exec jobby-backend sh -c 'sqlite3 /app/data/jobby.db ".dump"' > "$OUT"

git add "$OUT"
git commit -m "backup: DB dump $STAMP" || echo "Nothing to commit."
git push
echo "✅ Wrote $OUT and pushed."
