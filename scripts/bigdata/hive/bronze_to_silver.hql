-- Bronze -> Silver: cleaning, typing, deduplication
USE default;

CREATE EXTERNAL TABLE IF NOT EXISTS bronze_products (
  id STRING,
  name STRING,
  description STRING,
  category STRING,
  price STRING,
  created_at STRING
)
STORED AS PARQUET
LOCATION '/data/bronze/products/';

-- Create a managed silver table with normalized types
CREATE TABLE IF NOT EXISTS silver_products (
  id BIGINT,
  name STRING,
  description STRING,
  category STRING,
  price DOUBLE,
  created_at TIMESTAMP
)
STORED AS PARQUET;

-- Insert cleaned, typed, deduped
INSERT OVERWRITE TABLE silver_products
SELECT DISTINCT
  CAST(id AS BIGINT) as id,
  name,
  description,
  category,
  CASE WHEN price RLIKE '^[0-9]+(\\.[0-9]+)?$' THEN CAST(price AS DOUBLE) ELSE NULL END as price,
  cast(from_unixtime(unix_timestamp(created_at, 'yyyy-MM-dd HH:mm:ss')) as timestamp) as created_at
FROM bronze_products;
