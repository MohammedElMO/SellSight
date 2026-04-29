Big Data pipeline helpers for SellSight

Overview:
- Use existing `docker-compose.yml` to run Postgres and Kafka.
- Use `docker-compose -f docker-compose.yml -f docker-compose.bigdata.override.yml up -d` to bring up HDFS/Hive/Sqoop.

Typical workflow (Batch Relational Bridge):
1. Start services:

```bash
docker-compose -f docker-compose.yml -f docker-compose.bigdata.override.yml up -d hadoop-namenode hadoop-datanode hive-server sqoop
```

2. Create HDFS dirs (inside namenode container):

```bash
docker exec -it hadoop-namenode bash -lc "hdfs dfs -mkdir -p /data/bronze /data/silver /data/gold && hdfs dfs -chmod -R 777 /data"
```

3. Run snapshot import for tables (via sqoop container):

```bash
docker exec -it sqoop bash -lc "/opt/sqoop-scripts/import_snapshot.sh products"
```

4. Run Hive transform (bronze->silver):

```bash
# copy HQL into hive-server or use beeline
docker exec -it hive-server bash -lc "beeline -u 'jdbc:hive2://hive-server:10000' -f /opt/hive-scripts/bronze_to_silver.hql"
```

5. Run Silver->Gold aggregations (Hive):

```bash
docker exec -it hive-server bash -lc "beeline -u 'jdbc:hive2://hive-server:10000' -f /opt/hive-scripts/silver_to_gold.hql"
```

6. Export gold tables back to Postgres using Sqoop export:

```bash
docker exec -it sqoop bash -lc "/opt/sqoop-scripts/export_gold.sh /data/gold/products products_gold"
```

MapReduce example (Hadoop streaming):

```bash
# prepare events as tab-separated product_id\tevent_type\trating in /data/bronze/events
# run streaming job
docker exec -it hadoop-namenode bash -lc "hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -files /opt/mapreduce/popularity_mapper.py,/opt/mapreduce/popularity_reducer.py \
  -mapper popularity_mapper.py -reducer popularity_reducer.py \
  -input /data/bronze/events -output /data/gold/popularity_scores"
```

Notes:
- Adjust JDBC URLs and credentials as needed; containers reference `postgres` service name.
- For incremental Sqoop imports, keep track of last watermark (timestamp or id).
- For production, consider MinIO/HDFS replacement, secured Hive metastore, and resource tuning.
