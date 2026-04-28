-- Aggregates product scores into seller serving rows.

CREATE DATABASE IF NOT EXISTS sellsight_gold LOCATION '${hivevar:GOLD_DIR}';

CREATE EXTERNAL TABLE IF NOT EXISTS sellsight_gold.product_trend_scores (
    product_id          STRING,
    seller_id           STRING,
    category            STRING,
    views_count         BIGINT,
    clicks_count        BIGINT,
    add_to_cart_count   BIGINT,
    purchase_count      BIGINT,
    revenue_30d         DOUBLE,
    score               DOUBLE,
    computed_at         STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:MR_OUTPUT_DIR}';

DROP TABLE IF EXISTS sellsight_gold.seller_trend_scores;

CREATE TABLE sellsight_gold.seller_trend_scores
STORED AS ORC
AS
SELECT
    seller_id,
    SUM(views_count) AS views_count,
    SUM(clicks_count) AS clicks_count,
    SUM(add_to_cart_count) AS add_to_cart_count,
    SUM(purchase_count) AS purchase_count,
    SUM(revenue_30d) AS revenue_30d,
    SUM(score) AS score,
    MAX(computed_at) AS computed_at
FROM sellsight_gold.product_trend_scores
GROUP BY seller_id;

DROP TABLE IF EXISTS sellsight_gold.seller_trend_scores_export;

CREATE EXTERNAL TABLE sellsight_gold.seller_trend_scores_export (
    seller_id           STRING,
    views_count         BIGINT,
    clicks_count        BIGINT,
    add_to_cart_count   BIGINT,
    purchase_count      BIGINT,
    revenue_30d         DOUBLE,
    score               DOUBLE,
    computed_at         STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '${hivevar:SELLER_OUTPUT_DIR}';

INSERT OVERWRITE DIRECTORY '${hivevar:SELLER_OUTPUT_DIR}'
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
SELECT
    seller_id,
    CAST(views_count AS BIGINT),
    CAST(clicks_count AS BIGINT),
    CAST(add_to_cart_count AS BIGINT),
    CAST(purchase_count AS BIGINT),
    CAST(revenue_30d AS DOUBLE),
    CAST(score AS DOUBLE),
    CAST(computed_at AS STRING)
FROM sellsight_gold.seller_trend_scores;
