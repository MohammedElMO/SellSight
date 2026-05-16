#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.bigdata.yml)

POSTGRES_USER="${POSTGRES_USER:-sellsight}"
POSTGRES_DB="${POSTGRES_DB:-sellsight_db}"
JDBC_URL="${JDBC_URL:-https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.4/postgresql-42.7.4.jar}"

cd "${ROOT_DIR}"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

die() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

ensure_jdbc_driver() {
  local path="$1"
  if [[ -f "${path}" ]]; then
    return 0
  fi

  log "PostgreSQL JDBC driver is missing; downloading it"
  mkdir -p "$(dirname "${path}")"

  if command -v curl >/dev/null 2>&1; then
    curl -fL "${JDBC_URL}" -o "${path}"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "${path}" "${JDBC_URL}"
  else
    die "Missing ${path}, and neither curl nor wget is available. Download ${JDBC_URL} and save it as ${path}."
  fi
}

wait_for_container_cmd() {
  local container="$1"
  local command="$2"
  local label="$3"
  local attempts="${4:-60}"
  local delay="${5:-5}"

  log "Waiting for ${label}"
  for ((i = 1; i <= attempts; i++)); do
    if docker exec "${container}" bash -lc "${command}" >/dev/null 2>&1; then
      log "${label} is ready"
      return 0
    fi
    sleep "${delay}"
  done

  die "${label} did not become ready in time"
}

ensure_jdbc_driver "bigdata/jdbc/postgresql.jar"

log "Starting SellSight + Big Data containers"
docker compose "${COMPOSE_FILES[@]}" up -d

wait_for_container_cmd "sellsight-db" "pg_isready -U '${POSTGRES_USER}' -d '${POSTGRES_DB}'" "PostgreSQL"
wait_for_container_cmd "sellsight-namenode" "/opt/hadoop-3.2.1/bin/hdfs dfs -ls /" "HDFS"
wait_for_container_cmd "sellsight-hive-server" "/opt/hive/bin/hive -e 'SHOW DATABASES;'" "Hive"
wait_for_container_cmd "sellsight-spark-master" "/spark/bin/spark-submit --version" "Spark"

log "Importing PostgreSQL source tables to HDFS with Sqoop"
docker exec sellsight-sqoop bash /opt/sellsight/sqoop/import_postgres_to_hdfs.sh

log "Creating Hive raw and analytics databases/tables"
docker cp bigdata/hive/01_create_raw_tables.sql sellsight-hive-server:/tmp/01_create_raw_tables.sql
docker exec sellsight-hive-server /opt/hive/bin/hive -f /tmp/01_create_raw_tables.sql

log "Running Spark analytics batch"
docker cp bigdata/spark/sellsight_analytics.py sellsight-spark-master:/tmp/sellsight_analytics.py
docker exec sellsight-spark-master /spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  /tmp/sellsight_analytics.py

log "Preparing PostgreSQL analytics tables"
docker cp bigdata/sql/create_analytics_tables.sql sellsight-db:/tmp/create_analytics_tables.sql
docker exec sellsight-db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f /tmp/create_analytics_tables.sql
docker exec sellsight-db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "TRUNCATE analytics_daily_sales, analytics_top_products, analytics_event_funnel, analytics_category_sales, analytics_seller_performance, analytics_inventory_risk, analytics_monthly_sales, analytics_customer_value;"

log "Exporting processed analytics from HDFS to PostgreSQL with Sqoop"
docker exec sellsight-sqoop bash /opt/sellsight/sqoop/export_analytics_to_postgres.sh

log "Analytics row counts"
docker exec sellsight-db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "
SELECT 'analytics_daily_sales' AS table_name, count(*) FROM analytics_daily_sales
UNION ALL
SELECT 'analytics_top_products', count(*) FROM analytics_top_products
UNION ALL
SELECT 'analytics_event_funnel', count(*) FROM analytics_event_funnel
UNION ALL
SELECT 'analytics_category_sales', count(*) FROM analytics_category_sales
UNION ALL
SELECT 'analytics_seller_performance', count(*) FROM analytics_seller_performance
UNION ALL
SELECT 'analytics_inventory_risk', count(*) FROM analytics_inventory_risk
UNION ALL
SELECT 'analytics_monthly_sales', count(*) FROM analytics_monthly_sales
UNION ALL
SELECT 'analytics_customer_value', count(*) FROM analytics_customer_value;
"

log "Big Data batch completed"
