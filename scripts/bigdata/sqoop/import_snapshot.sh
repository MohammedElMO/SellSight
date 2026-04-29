#!/bin/bash
set -euo pipefail

# Usage: import_snapshot.sh <table> [--target-dir /data/bronze/<table>/YYYYMMDD]
TABLE=${1:-}
if [ -z "$TABLE" ]; then
  echo "Usage: $0 <table> [target-dir]"
  exit 1
fi

TARGET_DIR=${2:-/data/bronze/${TABLE}/$(date +%Y%m%d)}

# JDBC connection
PG_URL=${PG_URL:-jdbc:postgresql://postgres:5432/sellsight_db}
PG_USER=${PG_USER:-sellsight}
PG_PASS=${PG_PASS:-sellsight}

echo "Import snapshot of $TABLE -> HDFS $TARGET_DIR"

/opt/sqoop/bin/sqoop import \
  --connect "$PG_URL" \
  --username "$PG_USER" --password "$PG_PASS" \
  --table "$TABLE" \
  --target-dir "$TARGET_DIR" \
  --as-parquetfile \
  --num-mappers 4 \
  --compress \
  --compression-codec snappy

echo "Done."
