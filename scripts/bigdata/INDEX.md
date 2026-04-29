# SellSight Big Data Documentation Index

Welcome! This guide covers the complete Big Data pipeline with Hadoop, Hive, Sqoop, and MapReduce.

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| **[MAPREDUCE_INTEGRATION_SUMMARY.md](MAPREDUCE_INTEGRATION_SUMMARY.md)** | Quick overview of what was added | Everyone - START HERE |
| **[scripts/bigdata/ARCHITECTURE.md](scripts/bigdata/ARCHITECTURE.md)** | Complete system architecture & data flow | Architects, DevOps, Backend Engineers |
| **[scripts/bigdata/MAPREDUCE.md](scripts/bigdata/MAPREDUCE.md)** | Detailed MapReduce job documentation | Data Engineers, Backend Engineers |
| **[scripts/bigdata/MAPREDUCE_ADMIN_UI.md](scripts/bigdata/MAPREDUCE_ADMIN_UI.md)** | Integration examples for Admin UI | Frontend/Backend engineers implementing UIs |
| **[scripts/bigdata/README.md](scripts/bigdata/README.md)** | General pipeline helpers and commands | DevOps, Data Engineers |

---

## 🚀 Quick Start

### 1. Start Everything (5 min)
```bash
docker-compose up -d
bash scripts/bigdata/init-hadoop.sh
```

### 2. Run Complete Pipeline (5-10 min)
```bash
bash scripts/bigdata/run-pipeline.sh all
```

### 3. Verify Results
```bash
# Check HDFS structure
docker exec hadoop-namenode hdfs dfs -ls -R /data/

# Check PostgreSQL tables
docker exec postgres psql -U sellsight -d sellsight_db -c "\dt"

# Sample Query
docker exec postgres psql -U sellsight -d sellsight_db -c \
  "SELECT * FROM gold_product_popularity LIMIT 5;"
```

---

## 📊 What The Pipeline Does

### Phase 1: Import (Sqoop)
```
PostgreSQL Tables (products, users, orders, events)
        ↓
    Sqoop Import
        ↓
HDFS Bronze Layer (/data/bronze/*)
  - Raw data, Parquet format, unmodified
```

### Phase 2: Clean & Normalize (Hive)
```
HDFS Bronze
    ↓
Hive Transform
  - Type conversion (STRING → BIGINT, DOUBLE)
  - Validation (regex pattern matching)
  - Deduplication
    ↓
HDFS Silver Layer (/data/silver/*)
  - Clean, normalized data
```

### Phase 3: Aggregate (Hive + MapReduce) ⭐
```
HDFS Silver
    ├─ Hive Aggregations
    │   └─ Basic KPIs (product_scores, etc.)
    │
    └─ MapReduce Jobs (heavy parallel processing)
        ├─ Product Popularity Scores
        ├─ User Features & Engagement
        └─ Category Trends & Analytics
           ↓
HDFS Gold Layer (/data/gold/*)
  - Analytics-ready results
```

### Phase 4: Export (Sqoop)
```
HDFS Gold
    ↓
  Sqoop Export
    ↓
PostgreSQL Gold Tables
  - gold_product_popularity
  - gold_user_features
  - gold_category_trends
```

### Phase 5: Serve (API → UI)
```
PostgreSQL Gold Tables
    ↓
Backend APIs
  - /api/v1/sellers/{id}/analytics/top-products
  - /api/v1/admin/dashboard/category-trends
  - /api/v1/users/me/insights
    ↓
Frontend Dashboards
  - Seller Analytics Dashboard
  - Admin Category Trends
  - Consumer Shopping Insights
```

---

## 🎯 3 MapReduce Jobs Explained

### Job 1: Product Popularity Scores
**What**: Calculates engagement score for each product
**Formula**: `(views × 0.2) + (add_to_cart × 0.5) + (avg_rating × 0.3)`
**Output**: `/data/gold/product_popularity_scores`
**Use Case**: Seller dashboard widget showing top products

### Job 2: User Features
**What**: Extracts shopping behavior patterns per user
**Metrics**: 
- Total products viewed, carted, purchased
- Average rating given
- Preferred category
**Output**: `/data/gold/user_features`
**Use Case**: Consumer profile, personalization

### Job 3: Category Trends
**What**: Analyzes category-level metrics at scale
**Metrics**:
- Total views/carts per category
- Top 3 trending products
- Category trend score
**Output**: `/data/gold/category_trends`
**Use Case**: Admin dashboards, trending sections

---

## 📂 File Structure

```
scripts/bigdata/
├── sqoop/
│   ├── import_snapshot.sh      ← Import full table snapshot
│   ├── import_incremental.sh   ← Import only new/changed rows
│   └── export_gold.sh          ← Export Hive results back to Postgres
│
├── hive/
│   ├── bronze_to_silver.hql    ← Clean & validate data
│   ├── silver_to_gold.hql      ← Aggregate with Hive
│   └── gold_tables.hql         ← External tables on MapReduce outputs
│
├── mapreduce/
│   ├── popularity_mapper.py    ← Product scoring mapper
│   ├── popularity_reducer.py   ← Product scoring reducer
│   ├── user_features_mapper.py ← User behavior mapper
│   ├── user_features_reducer.py ← User behavior reducer
│   ├── category_trends_mapper.py ← Category trends mapper
│   └── category_trends_reducer.py ← Category trends reducer
│
├── run-pipeline.sh             ← Orchestrate entire workflow
├── run-mapreduce.sh            ← Run all 3 MapReduce jobs
├── init-hadoop.sh              ← Setup HDFS directories
│
├── ARCHITECTURE.md             ← System design & data flow
├── MAPREDUCE.md                ← MapReduce job details
├── MAPREDUCE_ADMIN_UI.md       ← UI implementation examples
└── README.md                   ← Command reference
```

---

## 🔧 Common Commands

```bash
# Full pipeline (recommended)
bash scripts/bigdata/run-pipeline.sh all

# Individual steps
bash scripts/bigdata/run-pipeline.sh init           # Setup
bash scripts/bigdata/run-pipeline.sh import         # Import
bash scripts/bigdata/run-pipeline.sh bronze-silver  # Clean
bash scripts/bigdata/run-pipeline.sh silver-gold    # Aggregate (Hive)
bash scripts/bigdata/run-pipeline.sh mapreduce      # MapReduce jobs
bash scripts/bigdata/run-pipeline.sh gold-tables    # Create tables
bash scripts/bigdata/run-pipeline.sh export         # Export to Postgres
bash scripts/bigdata/run-pipeline.sh verify         # Check results

# Just MapReduce
bash scripts/bigdata/run-mapreduce.sh

# Check HDFS
docker exec hadoop-namenode hdfs dfs -ls /data/

# Check PostgreSQL
docker exec postgres psql -U sellsight -d sellsight_db -c \
  "SELECT * FROM gold_product_popularity LIMIT 10;"
```

---

## 🎓 Learning Path

1. **Start**: Read [MAPREDUCE_INTEGRATION_SUMMARY.md](MAPREDUCE_INTEGRATION_SUMMARY.md)
2. **Understand**: Read [scripts/bigdata/ARCHITECTURE.md](scripts/bigdata/ARCHITECTURE.md)
3. **Deep Dive**: Read [scripts/bigdata/MAPREDUCE.md](scripts/bigdata/MAPREDUCE.md)
4. **Implement**: Follow [scripts/bigdata/MAPREDUCE_ADMIN_UI.md](scripts/bigdata/MAPREDUCE_ADMIN_UI.md)

---

## ❓ FAQ

**Q: How do I run just the MapReduce jobs without Sqoop/Hive?**
```bash
bash scripts/bigdata/run-mapreduce.sh
```

**Q: Can I schedule this to run daily?**
```bash
# Add to crontab:
0 2 * * * /path/to/scripts/bigdata/run-pipeline.sh all
```

**Q: How long does the pipeline take?**
- Init: 30 seconds
- Import: 2-3 minutes (5000 products)
- Hive transforms: 2-3 minutes
- MapReduce: 5-10 minutes (depending on cluster)
- Export: 1-2 minutes
- **Total: ~15-20 minutes**

**Q: Can I run it on real data?**
Yes! It scales to millions of rows. Adjust:
- `BATCH_SIZE` in Sqoop commands
- `numReduceTasks` in MapReduce jobs
- Hadoop cluster size (more DataNodes = faster)

**Q: What's the storage overhead?**
- Bronze (raw Parquet): ~150MB (14k products)
- Silver (clean): ~120MB
- Gold (aggregates): ~5-10MB
- **Total: ~300MB** (compressible further)

**Q: How do I monitor the jobs?**
- HDFS NameNode UI: http://localhost:9870
- Hive: `docker logs hive-server`
- MapReduce: Check job output in console

---

## 🚨 Troubleshooting

See [scripts/bigdata/MAPREDUCE.md](scripts/bigdata/MAPREDUCE.md) for detailed troubleshooting.

Common issues:
- **No input files**: Ensure silver layer exists
- **Job hangs**: Check HDFS disk space and available RAM
- **Export fails**: Verify PostgreSQL tables exist (schema mismatch)

---

## 📞 Support

For questions about:
- **Architecture**: See ARCHITECTURE.md
- **MapReduce jobs**: See MAPREDUCE.md  
- **UI implementation**: See MAPREDUCE_ADMIN_UI.md
- **Commands**: See README.md

---

**Last Updated**: April 28, 2026
**Status**: ✅ Complete - Ready for development
