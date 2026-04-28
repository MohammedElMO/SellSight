#!/usr/bin/env bash
set -euo pipefail

# Sqoop Bronze ingestion: import PostgreSQL tables into HDFS.
# Note: order_items is included because product-level purchases are derived from it.

SQOOP_BIN="${SQOOP_BIN:-sqoop}"
PG_JDBC_URL="${PG_JDBC_URL:-jdbc:postgresql://localhost:5432/sellsight_db}"
PG_USER="${PG_USER:-sellsight}"
PG_PASSWORD="${PG_PASSWORD:-sellsight}"
BRONZE_BASE="${HDFS_BRONZE_DIR:-/tmp/sellsight/bronze}"
LOAD_TS="$(date +%F-%H%M%S)"

import_table() {
  local table_name="$1"
  local target_dir="${BRONZE_BASE}/${table_name}/load_ts=${LOAD_TS}"
  echo "Importing ${table_name} -> ${target_dir}"
  "${SQOOP_BIN}" import \
    --connect "${PG_JDBC_URL}" \
    --username "${PG_USER}" \
    --password "${PG_PASSWORD}" \
    --table "${table_name}" \
    --target-dir "${target_dir}" \
    --delete-target-dir \
    --num-mappers 1 \
    --as-textfile \
    --fields-terminated-by $'\t' \
    --null-string '\\N' \
    --null-non-string '\\N'
}

import_table products
import_table orders
import_table order_items
import_table user_events
