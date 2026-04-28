-- Builds cleaned silver facts and writes the MapReduce input set.

set hive.exec.dynamic.partition=true;
set hive.exec.dynamic.partition.mode=nonstrict;

CREATE DATABASE IF NOT EXISTS sellsight_bronze LOCATION '${hivevar:BRONZE_DIR}';
CREATE DATABASE IF NOT EXISTS sellsight_silver LOCATION '${hivevar:SILVER_DIR}';

CREATE EXTERNAL TABLE IF NOT EXISTS sellsight_bronze.products (
    id              STRING,
    name            STRING,
    description     STRING,
    price           STRING,
    category        STRING,
    seller_id       STRING,
    image_url       STRING,
    brand           STRING,
    rating_avg      STRING,
    rating_count    STRING,
    sold_count      STRING,
    active          STRING,
    created_at      STRING,
    updated_at      STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:BRONZE_DIR}/products';

CREATE EXTERNAL TABLE IF NOT EXISTS sellsight_bronze.orders (
    id              STRING,
    customer_id     STRING,
    status          STRING,
    created_at      STRING,
    updated_at      STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:BRONZE_DIR}/orders';

CREATE EXTERNAL TABLE IF NOT EXISTS sellsight_bronze.order_items (
    id              STRING,
    product_id      STRING,
    product_name    STRING,
    quantity        STRING,
    unit_price      STRING,
    order_id        STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:BRONZE_DIR}/order_items';

CREATE EXTERNAL TABLE IF NOT EXISTS sellsight_bronze.user_events (
    id              STRING,
    user_id         STRING,
    product_id      STRING,
    event_type      STRING,
    session_id      STRING,
    price           STRING,
    timestamp       STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:BRONZE_DIR}/user_events';

DROP TABLE IF EXISTS sellsight_silver.product_engagement_source;

CREATE TABLE sellsight_silver.product_engagement_source
STORED AS ORC
AS
SELECT
    p.id AS product_id,
    p.seller_id AS seller_id,
    p.category AS category,
    COALESCE(ev.views_count, 0) AS views_count,
    COALESCE(ev.clicks_count, 0) AS clicks_count,
    COALESCE(ev.add_to_cart_count, 0) AS add_to_cart_count,
    COALESCE(pu.purchase_count, 0) AS purchase_count,
    COALESCE(pu.revenue_30d, 0) AS revenue_30d
FROM sellsight_bronze.products p
LEFT JOIN (
    SELECT
        product_id,
        COUNT(CASE WHEN LOWER(event_type) = 'view' THEN 1 END) AS views_count,
        COUNT(CASE WHEN LOWER(event_type) = 'click' THEN 1 END) AS clicks_count,
        COUNT(CASE WHEN LOWER(event_type) = 'add_to_cart' THEN 1 END) AS add_to_cart_count
    FROM sellsight_bronze.user_events
    GROUP BY product_id
) ev
    ON p.id = ev.product_id
LEFT JOIN (
    SELECT
        oi.product_id AS product_id,
        SUM(CASE WHEN o.status = 'DELIVERED' THEN CAST(oi.quantity AS BIGINT) ELSE 0 END) AS purchase_count,
        SUM(CASE WHEN o.status = 'DELIVERED' THEN CAST(oi.quantity AS DOUBLE) * CAST(oi.unit_price AS DOUBLE) ELSE 0 END) AS revenue_30d
    FROM sellsight_bronze.order_items oi
    JOIN sellsight_bronze.orders o
        ON oi.order_id = o.id
    GROUP BY oi.product_id
) pu
    ON p.id = pu.product_id
WHERE LOWER(COALESCE(p.active, 'true')) = 'true';

DROP TABLE IF EXISTS sellsight_silver.product_engagement_input;

CREATE EXTERNAL TABLE sellsight_silver.product_engagement_input (
    product_id          STRING,
    seller_id           STRING,
    category            STRING,
    views_count         BIGINT,
    clicks_count        BIGINT,
    add_to_cart_count   BIGINT,
    purchase_count      BIGINT,
    revenue_30d         DOUBLE
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:MR_INPUT_DIR}';

INSERT OVERWRITE DIRECTORY '${hivevar:MR_INPUT_DIR}'
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
SELECT
    product_id,
    seller_id,
    category,
    CAST(views_count AS BIGINT),
    CAST(clicks_count AS BIGINT),
    CAST(add_to_cart_count AS BIGINT),
    CAST(purchase_count AS BIGINT),
    CAST(revenue_30d AS DOUBLE)
FROM sellsight_silver.product_engagement_source;
