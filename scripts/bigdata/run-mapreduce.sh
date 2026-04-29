#!/bin/bash
set -euo pipefail

echo "🚀 MapReduce Jobs Orchestration"
echo "=============================="
echo ""

# Configuration
HADOOP_HOME=${HADOOP_HOME:-/opt/hadoop-3.2.1}
HADOOP_JAR="$HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar"
SCRIPTS_DIR="/opt/mapreduce"
NAMENODE="hadoop-namenode"

# Helper function to run MapReduce job
run_mapreduce_job() {
  local job_name=$1
  local input_dir=$2
  local output_dir=$3
  local mapper=$4
  local reducer=$5
  
  echo "📊 Running MapReduce: $job_name"
  echo "   Input: $input_dir"
  echo "   Output: $output_dir"
  
  # Remove output dir if exists (Hadoop doesn't overwrite)
  docker exec $NAMENODE bash -lc "$HADOOP_HOME/bin/hdfs dfs -rm -r $output_dir 2>/dev/null || true"
  
  # Run streaming job
  docker exec hadoop-namenode bash -lc "
    $HADOOP_HOME/bin/hadoop jar $HADOOP_JAR \
      -files $SCRIPTS_DIR/$mapper,$SCRIPTS_DIR/$reducer \
      -mapper ${mapper%.py} \
      -reducer ${reducer%.py} \
      -input $input_dir \
      -output $output_dir \
      -numReduceTasks 4 \
      -verbose
  " && echo "✅ $job_name completed" || echo "❌ $job_name failed"
  
  echo ""
}

# ============================================================

# 1. POPULARITY SCORE JOB
# Input from Hive: /data/silver/events
# Output: /data/gold/product_popularity_scores
echo "1️⃣  POPULARITY SCORE JOB"
echo "   Aggregates: views, add_to_cart, purchase, avg_rating → popularity_score"
run_mapreduce_job \
  "Product Popularity Scores" \
  "/data/silver/events" \
  "/data/gold/product_popularity_scores" \
  "popularity_mapper.py" \
  "popularity_reducer.py"

# ============================================================

# 2. USER FEATURES JOB
# Input: /data/silver/user_events
# Output: /data/gold/user_features
echo "2️⃣  USER FEATURES JOB"
echo "   Aggregates: products_viewed, products_carted, products_purchased, avg_rating"
run_mapreduce_job \
  "User Features" \
  "/data/silver/user_events" \
  "/data/gold/user_features" \
  "user_features_mapper.py" \
  "user_features_reducer.py"

# ============================================================

# 3. CATEGORY TRENDS JOB
# Input: /data/silver/category_products
# Output: /data/gold/category_trends
echo "3️⃣  CATEGORY TRENDS JOB"
echo "   Aggregates: category KPIs, top products, trend_score"
run_mapreduce_job \
  "Category Trends" \
  "/data/silver/category_products" \
  "/data/gold/category_trends" \
  "category_trends_mapper.py" \
  "category_trends_reducer.py"

# ============================================================

echo "🎉 All MapReduce jobs completed!"
echo ""
echo "Output locations:"
echo "  - Product Popularity: /data/gold/product_popularity_scores"
echo "  - User Features: /data/gold/user_features"  
echo "  - Category Trends: /data/gold/category_trends"
