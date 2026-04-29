#!/bin/bash
set -euo pipefail

echo "🔥 Initialiser le cluster HDFS et Hive..."

# Attendre que les services soient up
sleep 10

wait_for_hive() {
	echo "⏳ Attente du démarrage de HiveServer2..."
	for _ in $(seq 1 30); do
		if docker exec hive-server bash -lc "echo > /dev/tcp/localhost/10000" >/dev/null 2>&1; then
			echo "✅ HiveServer2 prêt"
			return 0
		fi
		sleep 5
	done
	echo "⚠️ HiveServer2 toujours indisponible après attente; on continue quand même"
}

echo "1️⃣  Créer structure de répertoires HDFS..."
docker exec hadoop-namenode bash -lc "/opt/hadoop-3.2.1/bin/hdfs dfs -mkdir -p /data/bronze /data/silver /data/gold"
docker exec hadoop-namenode bash -lc "/opt/hadoop-3.2.1/bin/hdfs dfs -chmod -R 777 /data"

echo "2️⃣  Créer namespace Hive..."
docker exec sellsight-db psql -U sellsight -d sellsight_db -tc "SELECT 1 FROM pg_database WHERE datname='sellsight_hive_metastore'" | grep -q 1 || \
docker exec sellsight-db psql -U sellsight -d sellsight_db -c "CREATE DATABASE sellsight_hive_metastore;"

echo "3️⃣  Initialiser schéma Hive Metastore..."
wait_for_hive
docker exec hive-server bash -lc "/opt/hive/bin/schematool -dbType postgres -initSchema" || echo "Metastore déjà initialisé"

echo "✅ Cluster prêt!"
echo ""
echo "Vérifier HDFS: http://localhost:9870"
echo "Vérifier Hive: docker exec hive-server bash -lc '/opt/hive/bin/beeline -u jdbc:hive2://localhost:10000'"
