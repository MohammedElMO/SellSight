# MapReduce Jobs - SellSight Big Data Pipeline

## Overview

MapReduce jobs process large volumes of Hadoop data in parallel for heavy aggregations and feature engineering. Three main jobs are implemented:

## Jobs

### 1. Product Popularity Scores
**Purpose**: Calculate product engagement and rating metrics at scale

**Scripts**:
- Mapper: `popularity_mapper.py` - Pass-through products and events
- Reducer: `popularity_reducer.py` - Aggregate metrics per product

**Output**: `/data/gold/product_popularity_scores`
```
product_id	views	add_to_cart	purchase	avg_rating	popularity_score
1001	1200	350	45	4.2	87.5
1002	950	280	38	3.8	76.2
```

**Formula**:
```
popularity_score = (views × 0.2) + (add_to_cart × 0.5) + (avg_rating × 0.3)
```

**Hive Table**:
```sql
CREATE EXTERNAL TABLE gold_product_popularity (
  product_id BIGINT,
  views BIGINT,
  add_to_cart BIGINT,
  purchase BIGINT,
  avg_rating DOUBLE,
  popularity_score DOUBLE
)
LOCATION '/data/gold/product_popularity_scores/';
```

---

### 2. User Features
**Purpose**: Extract shopping behavior patterns for each user

**Scripts**:
- Mapper: `user_features_mapper.py` - Extract user engagement events
- Reducer: `user_features_reducer.py` - Aggregate per user

**Output**: `/data/gold/user_features`
```
user_id	products_viewed	products_carted	products_purchased	avg_rating_given	preferred_category
123	45	12	3	4.2	Electronics
456	120	35	8	3.8	Fashion
```

**Hive Table**:
```sql
CREATE EXTERNAL TABLE gold_user_features (
  user_id BIGINT,
  products_viewed BIGINT,
  products_carted BIGINT,
  products_purchased BIGINT,
  avg_rating_given DOUBLE,
  preferred_category STRING
)
LOCATION '/data/gold/user_features/';
```

**Use Cases**:
- Consumer profile page (show shopping history)
- Personalized recommendations
- User segmentation (power users, browsers, etc.)

---

### 3. Category Trends
**Purpose**: Analyze category-level KPIs and identify trending products

**Scripts**:
- Mapper: `category_trends_mapper.py` - Extract category events
- Reducer: `category_trends_reducer.py` - Aggregate per category

**Output**: `/data/gold/category_trends`
```
category	total_views	total_carts	top_products	avg_rating	trend_score
Electronics	45000	12000	prod_A(5000),prod_B(4800)	4.3	125.5
Fashion	32000	8500	prod_X(3200),prod_Y(3000)	4.1	95.2
```

**Trend Score Calculation**:
```
trend_score = (total_views × 0.3 + total_carts × 0.7) / num_products
```

**Hive Table**:
```sql
CREATE EXTERNAL TABLE gold_category_trends (
  category STRING,
  total_views BIGINT,
  total_carts BIGINT,
  top_products STRING,
  avg_rating DOUBLE,
  trend_score DOUBLE
)
LOCATION '/data/gold/category_trends/';
```

**Use Cases**:
- Category dashboards
- "Trending Now" sections
- Category recommendations

---

## Running MapReduce Jobs

### Individual Job
```bash
docker exec hadoop-namenode bash -c "
  hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -files /opt/mapreduce/popularity_mapper.py,/opt/mapreduce/popularity_reducer.py \
    -mapper popularity_mapper.py \
    -reducer popularity_reducer.py \
    -input /data/silver/events \
    -output /data/gold/product_popularity_scores \
    -numReduceTasks 4
"
```

### All MapReduce Jobs (Automated)
```bash
bash scripts/bigdata/run-mapreduce.sh
```

### Within Full Pipeline
```bash
bash scripts/bigdata/run-pipeline.sh mapreduce
```

---

## Data Flow

```
PostgreSQL Events
    ↓
Sqoop Import
    ↓
HDFS Bronze Events
    ↓
Hive Transform (clean/normalize)
    ↓
HDFS Silver Events
    ↓
┌─────────────────────────────┐
│     MapReduce Jobs          │
├─────────────────────────────┤
│ Job 1: Popularity Scores    │ → /data/gold/product_popularity_scores
│ Job 2: User Features        │ → /data/gold/user_features
│ Job 3: Category Trends      │ → /data/gold/category_trends
└─────────────────────────────┘
    ↓
Hive External Tables (on MapReduce outputs)
    ↓
Sqoop Export
    ↓
PostgreSQL Gold Tables
    ↓
Backend APIs
    ↓
Frontend UIs (Admin & Consumer)
```

---

## Integration with Admin & Consumer UIs

### Admin Seller Dashboard
```typescript
// Fetch from gold_product_popularity
GET /api/v1/sellers/{sellerId}/analytics/products
├─ Popularity scores for seller's products
├─ Top by views, carts, ratings
└─ Trend visualization
```

### Consumer Recommendations
```typescript
// Fetch from gold_category_trends
GET /api/v1/recommendations?category={category}
├─ Trending products per category
├─ Top 3 products with engagement metrics
└─ Trend scores for sorting
```

### User Insights
```typescript
// Fetch from gold_user_features
GET /api/v1/users/{userId}/insights
├─ Shopping history (views, carts, purchases)
├─ Average rating given
├─ Preferred category
└─ Conversion metrics
```

---

## Performance Notes

- **Mapper parallelism**: Configured with default splits per input block (~64MB)
- **Reducer parallelism**: 4 reducers per job (configurable in `run-mapreduce.sh`)
- **Data format**: TSV (tab-separated values) for simple parsing
- **Compression**: Snappy compression on HDFS for storage efficiency
- **Estimated runtime**: 
  - 14,804 products + events: ~5-10 minutes on 3-node cluster
  - Scales linearly with data volume

---

## Troubleshooting

### Job fails with "No input files"
- Ensure silver layer exists: `hdfs dfs -ls /data/silver/events`
- Check input format matches mapper expectations

### Reducers hang or timeout
- Reduce data volume for testing: `hadoop dfs -rm /data/silver/events && exit`
- Increase cluster resources or adjust `numReduceTasks`

### Output file not found
- Verify job succeeded: `hadoop job -list all`
- Check HDFS output: `hdfs dfs -ls /data/gold/`

---

## Next Steps

1. **Schedule recurring runs**: Cron job or Airflow for daily/hourly refresh
2. **Fine-tune weighted formulas**: Adjust view/cart/rating weights based on business KPIs
3. **Add more jobs**: User clustering, product similarity, demand forecasting
4. **Real-time alternative**: Consider Spark Streaming for lower-latency updates

