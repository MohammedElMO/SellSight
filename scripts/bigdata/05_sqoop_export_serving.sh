#!/usr/bin/env bash
set -euo pipefail

# Sqoop export of gold results from HDFS to PostgreSQL serving tables.

SQOOP_BIN="${SQOOP_BIN:-sqoop}"
PG_JDBC_URL="${PG_JDBC_URL:-jdbc:postgresql://localhost:5432/sellsight_db}"
PG_USER="${PG_USER:-sellsight}"
PG_PASSWORD="${PG_PASSWORD:-sellsight}"
GOLD_DIR="${HDFS_GOLD_DIR:-/tmp/sellsight/gold}"
PRODUCTS_GOLD_DIR="${HDFS_MR_OUTPUT_DIR:-${GOLD_DIR}/product_trend_scores}"
SELLERS_GOLD_DIR="${HDFS_SELLER_OUTPUT_DIR:-${GOLD_DIR}/seller_trend_scores}"

export_table() {
  local table_name="$1"
  local columns="$2"
  local input_dir="$3"
  echo "Exporting ${input_dir} -> ${table_name}"
  "${SQOOP_BIN}" export \
    --connect "${PG_JDBC_URL}" \
    --username "${PG_USER}" \
    --password "${PG_PASSWORD}" \
    --table "${table_name}" \
    --export-dir "${input_dir}" \
    --input-fields-terminated-by $'\t' \
    --input-null-string '\\N' \
    --input-null-non-string '\\N' \
    --columns "${columns}" \
    --update-mode allowinsert \
    --update-key "$(echo "${columns}" | cut -d, -f1)"
}

export_table \
  product_trend_scores \
  product_id,seller_id,category,views_count,clicks_count,add_to_cart_count,purchase_count,revenue_30d,score,computed_at \
  "${PRODUCTS_GOLD_DIR}"

export_table \
  seller_trend_scores \
  seller_id,views_count,clicks_count,add_to_cart_count,purchase_count,revenue_30d,score,computed_at \
  "${SELLERS_GOLD_DIR}"
