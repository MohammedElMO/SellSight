#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sellsight_db}"
DB_USER="${POSTGRES_USER:-sellsight}"
DB_PASSWORD="${POSTGRES_PASSWORD:-sellsight}"
JDBC_JAR="${JDBC_JAR:-/opt/sellsight/jdbc/postgresql.jar}"
SQOOP_BIN="${SQOOP_BIN:-/usr/lib/sqoop/bin/sqoop}"

COMMON_ARGS=(
  --connect "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
  --username "${DB_USER}"
  --password "${DB_PASSWORD}"
  --driver org.postgresql.Driver
  --fields-terminated-by $'\001'
  --lines-terminated-by "\n"
  --null-string ""
  --null-non-string ""
  --delete-target-dir
  -m 1
)

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT id, first_name, last_name, email, password, role, created_at, is_virtual, auth_provider, provider_id FROM users WHERE \$CONDITIONS" \
  --target-dir /data/raw/users

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT id, name, description, price, category, seller_id, image_url, active, created_at, updated_at, brand, rating_avg, rating_count, sold_count FROM products WHERE \$CONDITIONS" \
  --target-dir /data/raw/products

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT id, customer_id, status, created_at, updated_at, shipping_cost, subtotal, discount, total FROM orders WHERE \$CONDITIONS" \
  --target-dir /data/raw/orders

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT id, product_id, product_name, quantity, unit_price, order_id FROM order_items WHERE \$CONDITIONS" \
  --target-dir /data/raw/order_items

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT product_id, quantity, reorder_threshold FROM inventory WHERE \$CONDITIONS" \
  --target-dir /data/raw/inventory

"${SQOOP_BIN}" import "${COMMON_ARGS[@]}" \
  --query "SELECT id::text AS id, user_id, product_id, event_type, session_id, price, timestamp AS event_timestamp FROM user_events WHERE \$CONDITIONS" \
  --target-dir /data/raw/user_events
