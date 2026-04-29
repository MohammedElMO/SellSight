#!/bin/bash
set -euo pipefail

echo "🚀 SellSight Big Data Pipeline Orchestration"
echo "============================================"
echo ""

STEP=${1:-all}

# Fonctions d'étapes
init_hadoop() {
  echo "1️⃣  Initialiser HDFS + Hive..."
  bash scripts/bigdata/init-hadoop.sh
}

import_snapshot() {
  echo "2️⃣  Importer données snapshot (Postgres → HDFS Bronze)..."
  for TABLE in products users orders; do
    echo "   Importing $TABLE..."
    docker exec sqoop bash -lc "bash /opt/sqoop-scripts/import_snapshot.sh $TABLE" || echo "   ⚠️ Import $TABLE skipped"
  done
}

bronze_to_silver() {
  echo "3️⃣  Transformer Bronze → Silver (nettoyage + typage)..."
  docker exec hive-server bash -lc "/opt/hive/bin/beeline -u 'jdbc:hive2://localhost:10000' -f /opt/hive-scripts/bronze_to_silver.hql" || echo "⚠️ Bronze→Silver skipped"
}

silver_to_gold() {
  echo "4️⃣  Transformer Silver → Gold (agrégations + KPIs via Hive)..."
  docker exec hive-server bash -lc "/opt/hive/bin/beeline -u 'jdbc:hive2://localhost:10000' -f /opt/hive-scripts/silver_to_gold.hql" || echo "⚠️ Silver→Gold skipped"
}

mapreduce_jobs() {
  echo "5️⃣  Exécuter MapReduce jobs (popularity, user_features, category_trends)..."
  bash scripts/bigdata/run-mapreduce.sh || echo "⚠️ MapReduce jobs skipped"
}

gold_tables_hive() {
  echo "6️⃣  Créer tables Hive sur sorties MapReduce..."
  docker exec hive-server bash -lc "/opt/hive/bin/beeline -u 'jdbc:hive2://localhost:10000' -f /opt/hive-scripts/gold_tables.hql" || echo "⚠️ Gold tables skipped"
}

export_gold() {
  echo "7️⃣  Exporter Gold → PostgreSQL (serving layer)..."
  docker exec sqoop bash -lc "bash /opt/sqoop-scripts/export_gold.sh /data/gold/products_scores product_scores_gold" || echo "⚠️ Export skipped"
}

verify() {
  echo "✅ Vérification et statistiques..."
  
  echo ""
  echo "📊 HDFS:"
  docker exec hadoop-namenode bash -lc "/opt/hadoop-3.2.1/bin/hdfs dfs -ls -R /data" 2>/dev/null || echo "  HDFS not ready"
  
  echo ""
  echo "📊 PostgreSQL Gold Tables:"
  docker exec sellsight-db psql -U sellsight -d sellsight_db -c "
    \d product_scores_gold 2>/dev/null || echo 'Table not yet created';
    SELECT COUNT(*) as records FROM product_scores_gold 2>/dev/null || echo '0';
  " 2>/dev/null || echo "  PostgreSQL check failed"
}

# Orchestration complète
if [ "$STEP" = "all" ]; then
  init_hadoop
  import_snapshot
  bronze_to_silver
  silver_to_gold
  mapreduce_jobs
  gold_tables_hive
  export_gold
  verify
elif [ "$STEP" = "init" ]; then
  init_hadoop
elif [ "$STEP" = "import" ]; then
  import_snapshot
elif [ "$STEP" = "bronze-silver" ]; then
  bronze_to_silver
elif [ "$STEP" = "silver-gold" ]; then
  silver_to_gold
elif [ "$STEP" = "mapreduce" ]; then
  mapreduce_jobs
elif [ "$STEP" = "gold-tables" ]; then
  gold_tables_hive
elif [ "$STEP" = "export" ]; then
  export_gold
elif [ "$STEP" = "verify" ]; then
  verify
else
  echo "Usage: $0 {all|init|import|bronze-silver|silver-gold|mapreduce|gold-tables|export|verify}"
  exit 1
fi

echo ""
echo "Done! ✨"
