#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sellsight_db}"
DB_USER="${POSTGRES_USER:-sellsight}"
DB_PASSWORD="${POSTGRES_PASSWORD:-sellsight}"
SQOOP_BIN="${SQOOP_BIN:-/usr/lib/sqoop/bin/sqoop}"

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_daily_sales \
  --export-dir /data/processed/daily_sales \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_category_sales \
  --export-dir /data/processed/category_sales \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_seller_performance \
  --export-dir /data/processed/seller_performance \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_inventory_risk \
  --export-dir /data/processed/inventory_risk \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_monthly_sales \
  --export-dir /data/processed/monthly_sales \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_customer_value \
  --export-dir /data/processed/customer_value \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_top_products \
  --export-dir /data/processed/top_products \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1

"${SQOOP_BIN}" export \
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  --username "${DB_USER}" \
  --password "${DB_PASSWORD}" \
  --driver org.postgresql.Driver \
  --table analytics_event_funnel \
  --export-dir /data/processed/event_funnel \
  --input-fields-terminated-by $'\001' \
  --input-lines-terminated-by "\n" \
  -m 1
