#!/usr/bin/env bash
set -euo pipefail

# Runs the MapReduce job that scores product trend from the Hive silver input.

MR_POM="${MR_POM:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../bigdata/mapreduce" && pwd)/pom.xml}"
HADOOP_BIN="${HADOOP_BIN:-hadoop}"
INPUT_DIR="${HDFS_MR_INPUT_DIR:-/tmp/sellsight/silver/product_engagement_input}"
OUTPUT_DIR="${HDFS_MR_OUTPUT_DIR:-/tmp/sellsight/gold/product_trend_scores}"

"${HADOOP_BIN}" fs -rm -r -f "${OUTPUT_DIR}" >/dev/null 2>&1 || true

mvn -f "${MR_POM}" -q -DskipTests package

JAR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../bigdata/mapreduce" && pwd)/target/sellsight-mapreduce-1.0.0-jar-with-dependencies.jar"

"${HADOOP_BIN}" jar "${JAR_PATH}" \
  org.example.sellsight.bigdata.mapreduce.TrendScoreJob \
  "${INPUT_DIR}" \
  "${OUTPUT_DIR}"
