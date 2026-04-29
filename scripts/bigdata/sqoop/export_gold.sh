#!/bin/bash
set -euo pipefail

# Usage: export_gold.sh <hdfs-export-dir> <pg-table>
HDFS_DIR=${1:-}
PG_TABLE=${2:-}
if [ -z "$HDFS_DIR" ] || [ -z "$PG_TABLE" ]; then
  echo "Usage: $0 <hdfs-export-dir> <pg-table>"
  exit 1
fi

PG_URL=${PG_URL:-jdbc:postgresql://postgres:5432/sellsight_db}
PG_USER=${PG_USER:-sellsight}
PG_PASS=${PG_PASS:-sellsight}

echo "Exporting $HDFS_DIR -> $PG_TABLE"

/opt/sqoop/bin/sqoop export \
  --connect "$PG_URL" \
  --username "$PG_USER" --password "$PG_PASS" \
  --table "$PG_TABLE" \
  --export-dir "$HDFS_DIR" \
  --input-fields-terminated-by '\t' \
  --num-mappers 4

echo "Export done."
