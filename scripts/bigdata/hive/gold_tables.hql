-- Gold layer tables for MapReduce outputs
USE default;

-- Table for MapReduce Product Popularity Scores output
CREATE EXTERNAL TABLE IF NOT EXISTS gold_product_popularity (
  product_id BIGINT,
  views BIGINT,
  add_to_cart BIGINT,
  purchase BIGINT,
  avg_rating DOUBLE,
  popularity_score DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/data/gold/product_popularity_scores/';

-- Table for MapReduce User Features output
CREATE EXTERNAL TABLE IF NOT EXISTS gold_user_features (
  user_id BIGINT,
  products_viewed BIGINT,
  products_carted BIGINT,
  products_purchased BIGINT,
  avg_rating_given DOUBLE,
  preferred_category STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/data/gold/user_features/';

-- Table for MapReduce Category Trends output
CREATE EXTERNAL TABLE IF NOT EXISTS gold_category_trends (
  category STRING,
  total_views BIGINT,
  total_carts BIGINT,
  top_products STRING,
  avg_rating DOUBLE,
  trend_score DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/data/gold/category_trends/';
