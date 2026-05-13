CREATE DATABASE IF NOT EXISTS sellsight_raw;
CREATE DATABASE IF NOT EXISTS sellsight_analytics;

USE sellsight_raw;

CREATE EXTERNAL TABLE IF NOT EXISTS users (
  id STRING,
  first_name STRING,
  last_name STRING,
  email STRING,
  password STRING,
  role STRING,
  created_at STRING,
  is_virtual BOOLEAN,
  auth_provider STRING,
  provider_id STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/users';

CREATE EXTERNAL TABLE IF NOT EXISTS products (
  id STRING,
  name STRING,
  description STRING,
  price DECIMAL(12,2),
  category STRING,
  seller_id STRING,
  image_url STRING,
  active BOOLEAN,
  created_at STRING,
  updated_at STRING,
  brand STRING,
  rating_avg DECIMAL(3,2),
  rating_count INT,
  sold_count INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/products';

CREATE EXTERNAL TABLE IF NOT EXISTS orders (
  id STRING,
  customer_id STRING,
  status STRING,
  created_at STRING,
  updated_at STRING,
  shipping_cost DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  discount DECIMAL(12,2),
  total DECIMAL(12,2)
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/orders';

CREATE EXTERNAL TABLE IF NOT EXISTS order_items (
  id BIGINT,
  product_id STRING,
  product_name STRING,
  quantity INT,
  unit_price DECIMAL(12,2),
  order_id STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/order_items';

CREATE EXTERNAL TABLE IF NOT EXISTS inventory (
  product_id STRING,
  quantity INT,
  reorder_threshold INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/inventory';

CREATE EXTERNAL TABLE IF NOT EXISTS user_events (
  id STRING,
  user_id STRING,
  product_id STRING,
  event_type STRING,
  session_id STRING,
  price DECIMAL(12,2),
  event_timestamp STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\001'
STORED AS TEXTFILE
LOCATION '/data/raw/user_events';
