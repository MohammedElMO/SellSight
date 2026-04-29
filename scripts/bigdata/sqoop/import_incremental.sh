#!/bin/bash
set -euo pipefail

# Usage: import_incremental.sh <table> <check-column> <last-value> [target-dir]
TABLE=${1:-}
CHECK_COL=${2:-}
LAST_VAL=${3:-}
if [ -z "$TABLE" ] || [ -z "$CHECK_COL" ] || [ -z "$LAST_VAL" ]; then
  echo "Usage: $0 <table> <check-column> <last-value> [target-dir]"
  exit 1
fi

TARGET_DIR=${4:-/data/bronze/${TABLE}/incremental/$(date +%Y%m%d%H%M%S)}

PG_URL=${PG_URL:-jdbc:postgresql://postgres:5432/sellsight_db}
PG_USER=${PG_USER:-sellsight}
PG_PASS=${PG_PASS:-sellsight}

echo "Import incremental of $TABLE where $CHECK_COL > $LAST_VAL -> $TARGET_DIR"

/opt/sqoop/bin/sqoop import \
  --connect "$PG_URL" \
  --username "$PG_USER" --password "$PG_PASS" \
  --table "$TABLE" \
  --where "$CHECK_COL > '$LAST_VAL'" \
  --target-dir "$TARGET_DIR" \
  --as-parquetfile \
  --num-mappers 4 \
  --append \
  --compress \
  --compression-codec snappy

echo "Done."
