-- Silver -> Gold: business KPIs aggregation
USE default;

CREATE TABLE IF NOT EXISTS gold_product_scores (
  product_id BIGINT,
  views BIGINT,
  add_to_cart BIGINT,
  avg_rating DOUBLE,
  popularity_score DOUBLE
)
STORED AS PARQUET;

-- Example aggregation: assuming there are event tables in silver (events)
-- For demo, aggregate from silver_products join with events in /data/silver/events

CREATE EXTERNAL TABLE IF NOT EXISTS silver_events (
  event_id STRING,
  product_id STRING,
  event_type STRING,
  user_id STRING,
  event_ts STRING,
  rating STRING
)
STORED AS PARQUET
LOCATION '/data/silver/events/';

INSERT OVERWRITE TABLE gold_product_scores
SELECT
  CAST(e.product_id AS BIGINT) as product_id,
  SUM(CASE WHEN e.event_type='view' THEN 1 ELSE 0 END) as views,
  SUM(CASE WHEN e.event_type='add_to_cart' THEN 1 ELSE 0 END) as add_to_cart,
  AVG(CASE WHEN e.rating RLIKE '^[0-9]+(\\.[0-9]+)?$' THEN CAST(e.rating AS DOUBLE) ELSE NULL END) as avg_rating,
  (SUM(CASE WHEN e.event_type='view' THEN 1 ELSE 0 END) * 0.2 
   + SUM(CASE WHEN e.event_type='add_to_cart' THEN 1 ELSE 0 END) * 0.5 
   + COALESCE(AVG(CASE WHEN e.rating RLIKE '^[0-9]+(\\.[0-9]+)?$' THEN CAST(e.rating AS DOUBLE) ELSE NULL END),0) * 0.3) as popularity_score
FROM silver_events e
GROUP BY CAST(e.product_id AS BIGINT);
