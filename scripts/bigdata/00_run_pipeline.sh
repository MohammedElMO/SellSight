#!/usr/bin/env bash
set -euo pipefail

# End-to-end SellSight batch pipeline.
# 1) Sqoop imports bronze snapshots from PostgreSQL to HDFS.
# 2) Hive builds silver facts and the MapReduce input set.
# 3) Hadoop MapReduce computes product trend scores.
# 4) Hive rolls up seller metrics.
# 5) Sqoop exports the gold tables back to PostgreSQL serving tables.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRONZE_DIR="${HDFS_BRONZE_DIR:-/tmp/sellsight/bronze}"
SILVER_DIR="${HDFS_SILVER_DIR:-/tmp/sellsight/silver}"
GOLD_DIR="${HDFS_GOLD_DIR:-/tmp/sellsight/gold}"
MR_INPUT_DIR="${HDFS_MR_INPUT_DIR:-${SILVER_DIR}/product_engagement_input}"
MR_OUTPUT_DIR="${HDFS_MR_OUTPUT_DIR:-${GOLD_DIR}/product_trend_scores}"
SELLER_OUTPUT_DIR="${HDFS_SELLER_OUTPUT_DIR:-${GOLD_DIR}/seller_trend_scores}"

mkdir -p "${BRONZE_DIR}" "${SILVER_DIR}" "${GOLD_DIR}"

"${SCRIPT_DIR}/01_sqoop_import_bronze.sh"
hive \
  -hivevar BRONZE_DIR="${BRONZE_DIR}" \
  -hivevar SILVER_DIR="${SILVER_DIR}" \
  -hivevar MR_INPUT_DIR="${MR_INPUT_DIR}" \
  -f "${SCRIPT_DIR}/02_hive_silver_and_mr_input.hql"
"${SCRIPT_DIR}/03_run_mapreduce_trend_score.sh"
hive \
  -hivevar GOLD_DIR="${GOLD_DIR}" \
  -hivevar MR_OUTPUT_DIR="${MR_OUTPUT_DIR}" \
  -hivevar SELLER_OUTPUT_DIR="${SELLER_OUTPUT_DIR}" \
  -f "${SCRIPT_DIR}/04_hive_seller_rollup.hql"
"${SCRIPT_DIR}/05_sqoop_export_serving.sh"
