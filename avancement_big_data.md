# Avancement SellSight - Kafka, Big Data, Analytics et Dashboards

Date de mise a jour: 2026-05-13

Ce fichier resume ce qui a ete implemente dans SellSight pour Kafka, Big Data
batch, recommandations client, analytics admin, analytics seller, et comment un
autre developpeur peut executer le projet.

## 1. Objectif General

L'objectif etait d'ajouter une architecture analytics complete autour de
SellSight:

```text
Frontend tracking
  -> Backend events
  -> Kafka temps reel
  -> PostgreSQL user_events
  -> Sqoop import
  -> HDFS raw zone
  -> Hive raw tables
  -> Spark batch analytics
  -> HDFS processed zone
  -> Sqoop export
  -> PostgreSQL analytics tables
  -> Admin dashboard / Admin analytics / Seller dashboard / Customer homepage
```

On garde deux familles de donnees:

```text
Kafka / PostgreSQL live:
  donnees recentes, comportement utilisateur, recommandations, funnel 7 jours.

Big Data batch Hadoop/Hive/Spark/Sqoop:
  historique et agregations lourdes, rafraichies par batch.
```

## 2. Partie Kafka

### 2.1 Topics Kafka

Les topics configures sont:

```text
inventory.updated
order.created
order.fulfilled
user.activity
```

Fichiers principaux:

```text
src/main/java/org/example/sellsight/config/KafkaConfig.java
src/main/java/org/example/sellsight/kafka/producer/InventoryProducerService.java
src/main/java/org/example/sellsight/kafka/producer/OrderProducerService.java
src/main/java/org/example/sellsight/kafka/producer/UserActivityProducerService.java
src/main/java/org/example/sellsight/kafka/consumer/InventoryConsumer.java
src/main/java/org/example/sellsight/kafka/consumer/OrderConsumer.java
src/main/java/org/example/sellsight/kafka/consumer/ActivityConsumer.java
src/main/java/org/example/sellsight/event/UserActivityEvent.java
```

### 2.2 Producteurs Kafka

Les services producteurs publient des messages JSON vers Kafka:

```text
InventoryProducerService:
  publie les changements de stock.

OrderProducerService:
  publie les commandes creees et les changements de statut.

UserActivityProducerService:
  publie les actions utilisateur: vue produit, ajout panier, recherche, achat, etc.
```

### 2.3 Consumers Kafka

Les consumers lisent les topics et permettent de traiter les evenements:

```text
InventoryConsumer:
  ecoute inventory.updated.

OrderConsumer:
  ecoute order.created et order.fulfilled.

ActivityConsumer:
  ecoute user.activity.
  Sert pour le tracking comportemental, funnel, recommandations futures.
```

### 2.4 Endpoint de tracking comportemental

Le frontend envoie les evenements vers le backend. Le backend les publie vers
Kafka et les garde aussi dans PostgreSQL quand necessaire pour les analytics.

Fichiers lies:

```text
src/main/java/org/example/sellsight/behavioral/infrastructure/web/EventController.java
src/main/java/org/example/sellsight/analytics/application/usecase/RecordEventUseCase.java
sellsight-front/src/hooks/useTracker.ts
sellsight-front/src/lib/use-tracker.ts
```

### 2.5 Cache analytics

Un cache court a ete ajoute pour eviter de recalculer trop souvent certaines
requetes analytics.

Fichier:

```text
src/main/java/org/example/sellsight/config/CacheConfig.java
```

Caches importants:

```text
analytics-summary
consumer-recommendations
```

## 3. Recommandations Client - "Recommended for you"

### 3.1 Backend

Un endpoint permet au client connecte de recuperer des recommandations:

```text
GET /users/me/recommendations
```

Fichiers:

```text
src/main/java/org/example/sellsight/user/infrastructure/web/UserController.java
src/main/java/org/example/sellsight/analytics/application/usecase/GetConsumerRecommendationsUseCase.java
src/main/java/org/example/sellsight/analytics/infrastructure/web/dto/ConsumerRecommendationDto.java
src/main/java/org/example/sellsight/analytics/infrastructure/persistence/repository/AnalyticsQueryRepository.java
```

La logique utilise les evenements recents:

```text
VIEW        -> score faible
ADD_TO_CART -> score moyen
PURCHASE    -> score fort
```

Les produits sont classes avec un score base sur les interactions.

### 3.2 Frontend Customer Homepage

Sur la homepage customer, une section apparait:

```text
Recommended for you
```

Fichiers:

```text
sellsight-front/src/app/page.tsx
sellsight-front/src/lib/services.ts
shared/types/index.ts
```

Workflow:

```text
1. Le frontend appelle recommendationApi.getMyRecommendations().
2. Il recoit une liste de productId recommandes.
3. Il appelle productApi.getById(id) pour recuperer les details produit.
4. Il affiche les produits dans un rail "Recommended for you".
```

## 4. Analytics Seller Dashboard

### 4.1 Backend

Un endpoint seller analytics a ete ajoute pour donner au vendeur des stats sur
ses produits:

```text
GET /analytics/seller
```

Fichiers:

```text
src/main/java/org/example/sellsight/analytics/infrastructure/web/AnalyticsController.java
src/main/java/org/example/sellsight/analytics/application/usecase/GetSellerAnalyticsUseCase.java
src/main/java/org/example/sellsight/analytics/infrastructure/web/dto/SellerAnalyticsDto.java
src/main/java/org/example/sellsight/analytics/infrastructure/web/dto/SellerProductAnalyticsDto.java
src/main/java/org/example/sellsight/analytics/infrastructure/persistence/repository/AnalyticsQueryRepository.java
```

Donnees exposees:

```text
totalViews
totalAddToCarts
totalPurchases
viewToCartRate
viewToPurchaseRate
products[]
```

Chaque produit seller contient:

```text
productId
productName
imageUrl
active
views
addToCarts
purchases
viewToCartRate
viewToPurchaseRate
```

### 4.2 Frontend Seller Dashboard

La page seller dashboard affiche maintenant les indicateurs analytics seller:

```text
Views
Carts
Purchases
Conversion rates
Product-level performance
```

Fichier principal:

```text
sellsight-front/src/app/seller/dashboard/page.tsx
```

## 5. Partie Big Data

### 5.1 Stack Docker Big Data

Un compose separe a ete ajoute:

```text
docker-compose.bigdata.yml
```

Il ajoute:

```text
Hadoop NameNode
Hadoop DataNode
YARN ResourceManager
YARN NodeManager
Hive Metastore PostgreSQL
Hive Metastore
HiveServer2
Spark Master
Spark Worker
Sqoop
```

Images utilisees:

```text
bde2020/hadoop-namenode:2.0.0-hadoop3.2.1-java8
bde2020/hadoop-datanode:2.0.0-hadoop3.2.1-java8
bde2020/hive:2.3.2-postgresql-metastore
bde2020/spark-master:3.2.1-hadoop3.2
bde2020/spark-worker:3.2.1-hadoop3.2
applysq/sqoop:1.4.7_hadoop_3.1.2_v3.1
```

UIs utiles:

```text
HDFS NameNode: http://localhost:9870
YARN ResourceManager: http://localhost:8088
Spark Master: http://localhost:8080
HiveServer2 JDBC: jdbc:hive2://localhost:10000
Backend API: http://localhost:8081
Frontend: http://localhost:3000
```

### 5.2 Fichiers Big Data

```text
docker-compose.bigdata.yml
bigdata/hadoop-conf/core-site.xml
bigdata/hadoop-conf/hdfs-site.xml
bigdata/hadoop-conf/mapred-site.xml
bigdata/hadoop-conf/yarn-site.xml
bigdata/hive/01_create_raw_tables.sql
bigdata/spark/conf/hive-site.xml
bigdata/spark/sellsight_analytics.py
bigdata/sql/create_analytics_tables.sql
bigdata/sqoop/import_postgres_to_hdfs.sh
bigdata/sqoop/export_analytics_to_postgres.sh
bigdata/jdbc/.gitkeep
```

Important:

```text
bigdata/jdbc/postgresql.jar
```

Ce fichier n'est pas pousse dans GitHub. Il est ignore par `.gitignore`.
Les scripts peuvent le telecharger automatiquement si absent.

### 5.3 Sqoop Import PostgreSQL vers HDFS

Script:

```text
bigdata/sqoop/import_postgres_to_hdfs.sh
```

Tables importees depuis PostgreSQL:

```text
users
products
orders
order_items
inventory
user_events
```

Destination HDFS:

```text
/data/raw/users
/data/raw/products
/data/raw/orders
/data/raw/order_items
/data/raw/inventory
/data/raw/user_events
```

Le separateur utilise est Control-A:

```text
\001
```

Raison: eviter les problemes avec les virgules dans les noms et descriptions.

### 5.4 Hive Raw Tables

Script:

```text
bigdata/hive/01_create_raw_tables.sql
```

Databases Hive:

```text
sellsight_raw
sellsight_analytics
```

Tables raw:

```text
sellsight_raw.users
sellsight_raw.products
sellsight_raw.orders
sellsight_raw.order_items
sellsight_raw.inventory
sellsight_raw.user_events
```

### 5.5 Spark Analytics Batch

Script:

```text
bigdata/spark/sellsight_analytics.py
```

Spark lit les tables Hive raw et calcule les tables analytics:

```text
sellsight_analytics.daily_sales
sellsight_analytics.top_products
sellsight_analytics.event_funnel
sellsight_analytics.category_sales
sellsight_analytics.seller_performance
sellsight_analytics.inventory_risk
sellsight_analytics.monthly_sales
sellsight_analytics.customer_value
```

Spark ecrit aussi les resultats dans HDFS:

```text
/data/processed/daily_sales
/data/processed/top_products
/data/processed/event_funnel
/data/processed/category_sales
/data/processed/seller_performance
/data/processed/inventory_risk
/data/processed/monthly_sales
/data/processed/customer_value
```

### 5.6 Sqoop Export HDFS vers PostgreSQL

Script:

```text
bigdata/sqoop/export_analytics_to_postgres.sh
```

Tables PostgreSQL remplies:

```text
analytics_daily_sales
analytics_top_products
analytics_event_funnel
analytics_category_sales
analytics_seller_performance
analytics_inventory_risk
analytics_monthly_sales
analytics_customer_value
```

Creation des tables:

```text
bigdata/sql/create_analytics_tables.sql
```

## 6. Analytics Admin

### 6.1 Backend Admin Summary

Endpoint principal:

```text
GET /admin/analytics/summary
```

Fichiers:

```text
src/main/java/org/example/sellsight/analytics/infrastructure/web/AnalyticsController.java
src/main/java/org/example/sellsight/analytics/application/usecase/GetAnalyticsSummaryUseCase.java
src/main/java/org/example/sellsight/analytics/infrastructure/web/dto/AnalyticsSummaryDto.java
src/main/java/org/example/sellsight/analytics/infrastructure/persistence/repository/AnalyticsQueryRepository.java
```

Champs live / recents:

```text
revenueToday
revenue7d
revenue30d
ordersToday
orders7d
orders30d
activeUsersLastHour
activeUsers7d
newUsers7d
cancelledOrders7d
averageOrderValue7d
conversion7d
productViews7d
addToCart7d
purchases7d
viewToCartRate7d
cartToPurchaseRate7d
consumerRecommendations
topProducts
```

Champs Big Data batch:

```text
historicalDailySales
historicalTopProducts
historicalEventFunnel
categorySales
sellerPerformance
inventoryRisk
monthlySales
customerValue
```

DTOs ajoutes:

```text
CategorySalesDto
SellerPerformanceDto
InventoryRiskDto
MonthlySalesDto
CustomerValueDto
HistoricalDailySalesDto
HistoricalEventFunnelDto
TopProductDto
ConsumerRecommendationDto
```

### 6.2 Frontend Admin Analytics

Fichier:

```text
sellsight-front/src/app/admin/analytics/page.tsx
```

Blocs existants / live:

```text
Revenue Trend
Order Funnel
Customer Behavior
Top Products (7d)
Low Stock
```

Blocs Big Data ajoutes:

```text
Sales History
Engagement Mix
Best Sellers
Category Sales
Monthly Sales
Seller Performance
Inventory Risk
Customer Value
```

Important: l'interface ne montre pas les mots Hive, HDFS, Sqoop ou Spark. Pour
l'utilisateur admin, ce sont simplement des analytics enrichies.

### 6.3 Frontend Admin Dashboard

Fichier:

```text
sellsight-front/src/app/admin/dashboard/page.tsx
```

Ajouts:

```text
Sales Snapshot
Leading Products
```

Correction faite:

```text
Revenue Today
```

Avant, la carte affichait une valeur fausse comme `$8,999`, parce que
`AnimCounter` transformait `89.99` en `8999`. Maintenant le dashboard utilise
`formatPrice(...)` pour l'argent et prend le total live des commandes du jour.

## 7. Automatisation du Batch Big Data

### 7.1 Script Windows PowerShell

Fichier:

```text
scripts/run_bigdata_batch.ps1
```

Commande:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

Ce script fait automatiquement:

```text
1. Demarre Docker Compose app + Big Data
2. Telecharge le driver PostgreSQL JDBC si absent
3. Attend PostgreSQL
4. Attend HDFS
5. Attend Hive
6. Attend Spark
7. Lance Sqoop import PostgreSQL -> HDFS
8. Cree les tables Hive
9. Lance Spark analytics
10. Cree les tables analytics PostgreSQL
11. Truncate les tables analytics PostgreSQL
12. Lance Sqoop export HDFS -> PostgreSQL
13. Affiche le nombre de lignes par table
```

Sur cette machine, cette commande a ete executee avec succes.

### 7.2 Script Bash

Fichier:

```text
scripts/run_bigdata_batch.sh
```

Commande:

```bash
bash scripts/run_bigdata_batch.sh
```

Note: sur cette machine Windows, cette commande a echoue car WSL n'avait pas
`/bin/bash`. La version PowerShell a donc ete utilisee. Sur Linux, macOS, Git
Bash ou WSL correctement installe, le script Bash doit marcher.

### 7.3 Planification tous les 2 jours

Fichier:

```text
scripts/register_bigdata_schedule.ps1
```

Commande Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register_bigdata_schedule.ps1
```

Par defaut:

```text
Tous les 2 jours a 02:00
```

Changer l'heure:

```powershell
$env:BIGDATA_START_TIME="03:30"
powershell -ExecutionPolicy Bypass -File scripts/register_bigdata_schedule.ps1
```

Supprimer la tache:

```powershell
Unregister-ScheduledTask -TaskName "SellSight Big Data Batch" -Confirm:$false
```

## 8. Resultats Verifies Aujourd'hui

Le batch complet a ete execute avec succes via:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

### 8.1 Verification HDFS Raw

```text
/data/raw/inventory
/data/raw/order_items
/data/raw/orders
/data/raw/products
/data/raw/user_events
/data/raw/users
```

### 8.2 Verification HDFS Processed

```text
/data/processed/category_sales
/data/processed/customer_value
/data/processed/daily_sales
/data/processed/event_funnel
/data/processed/inventory_risk
/data/processed/monthly_sales
/data/processed/seller_performance
/data/processed/top_products
```

### 8.3 Verification PostgreSQL

```text
analytics_daily_sales: 7 lignes
analytics_top_products: 20 lignes
analytics_event_funnel: 3 lignes
analytics_category_sales: 6 lignes
analytics_seller_performance: 1 ligne
analytics_inventory_risk: 102 lignes
analytics_monthly_sales: 1 ligne
analytics_customer_value: 3 lignes
```

## 9. Comment Executer le Projet

### 9.1 Prerequis

Installer:

```text
Docker Desktop
Java 21
Node.js
pnpm
Git
```

Verifier:

```powershell
docker --version
java -version
node -v
pnpm -v
```

### 9.2 Demarrer les services principaux

Depuis la racine du projet:

```powershell
docker compose up -d
```

Cela lance:

```text
PostgreSQL
Kafka
Redis
Embedding service
Backend
```

### 9.3 Demarrer aussi Big Data

Pour lancer app + Big Data:

```powershell
docker compose -f docker-compose.yml -f docker-compose.bigdata.yml up -d
```

Ou plus simple, lancer directement le batch:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

### 9.4 Rebuild Backend apres modification Java

Si le code Java change:

```powershell
docker compose up -d --build backend
```

Cas obligatoire apres modification de:

```text
DTO Java
UseCase Java
Repository Java
Controller Java
configuration Spring
```

### 9.5 Lancer le frontend

Depuis le dossier frontend:

```powershell
cd sellsight-front
pnpm install
pnpm dev
```

Frontend:

```text
http://localhost:3000
```

### 9.6 Rebuild frontend si besoin

Verification TypeScript:

```powershell
cd sellsight-front
pnpm exec tsc --noEmit --pretty false
```

Build:

```powershell
pnpm build
```

### 9.7 Compiler backend localement

Depuis la racine:

```powershell
.\mvnw.cmd -DskipTests compile
```

## 10. Commandes de Verification Utiles

### 10.1 Voir les containers

```powershell
docker ps
```

### 10.2 Verifier HDFS raw

```powershell
docker exec sellsight-namenode /opt/hadoop-3.2.1/bin/hdfs dfs -ls /data/raw
```

### 10.3 Verifier HDFS processed

```powershell
docker exec sellsight-namenode /opt/hadoop-3.2.1/bin/hdfs dfs -ls /data/processed
```

### 10.4 Verifier tables analytics PostgreSQL

```powershell
docker exec sellsight-db psql -U sellsight -d sellsight_db -c "SELECT 'analytics_daily_sales' AS table_name, count(*) FROM analytics_daily_sales UNION ALL SELECT 'analytics_top_products', count(*) FROM analytics_top_products UNION ALL SELECT 'analytics_event_funnel', count(*) FROM analytics_event_funnel UNION ALL SELECT 'analytics_category_sales', count(*) FROM analytics_category_sales UNION ALL SELECT 'analytics_seller_performance', count(*) FROM analytics_seller_performance UNION ALL SELECT 'analytics_inventory_risk', count(*) FROM analytics_inventory_risk UNION ALL SELECT 'analytics_monthly_sales', count(*) FROM analytics_monthly_sales UNION ALL SELECT 'analytics_customer_value', count(*) FROM analytics_customer_value;"
```

### 10.5 Verifier topics Kafka

```powershell
docker exec sellsight-kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

### 10.6 Lire le topic user.activity

```powershell
docker exec sellsight-kafka kafka-console-consumer.sh --topic user.activity --from-beginning --bootstrap-server localhost:9092
```

## 11. Fichiers Importants a Pousser sur GitHub

Pousser:

```text
docker-compose.bigdata.yml
bigdata/
scripts/run_bigdata_batch.ps1
scripts/run_bigdata_batch.sh
scripts/register_bigdata_schedule.ps1
KAFKA_SETUP.md
avancement_big_data.md
src/main/java/org/example/sellsight/analytics/
src/main/java/org/example/sellsight/kafka/
src/main/java/org/example/sellsight/event/
src/main/java/org/example/sellsight/config/KafkaConfig.java
src/main/java/org/example/sellsight/config/CacheConfig.java
sellsight-front/src/app/admin/analytics/page.tsx
sellsight-front/src/app/admin/dashboard/page.tsx
sellsight-front/src/app/seller/dashboard/page.tsx
sellsight-front/src/app/page.tsx
sellsight-front/src/lib/services.ts
shared/types/index.ts
```

Ne pas pousser:

```text
bigdata/jdbc/postgresql.jar
.env
node_modules/
target/
```

Le `.gitignore` ignore deja:

```text
bigdata/jdbc/*.jar
```

## 12. Validations Effectuees

Backend:

```powershell
.\mvnw.cmd -DskipTests compile
```

Resultat:

```text
BUILD SUCCESS
```

Frontend:

```powershell
cd sellsight-front
pnpm exec tsc --noEmit --pretty false
```

Resultat:

```text
OK
```

Batch Big Data:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

Resultat:

```text
Import Sqoop OK
Hive OK
Spark OK
Export Sqoop OK
Tables PostgreSQL analytics remplies
```

## 13. Notes Importantes pour Ton Camarade

1. Sur Windows, utiliser le script PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

2. Sur Linux/macOS/Git Bash/WSL avec bash installe:

```bash
bash scripts/run_bigdata_batch.sh
```

3. Apres un changement Java, rebuild le backend:

```powershell
docker compose up -d --build backend
```

4. Si les nouveaux champs analytics ne s'affichent pas dans le frontend, verifier:

```text
backend rebuild
frontend refresh
endpoint /admin/analytics/summary
tables PostgreSQL analytics remplies
```

5. Si les tables analytics sont vides, relancer:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_bigdata_batch.ps1
```

6. Si Docker est lent, attendre quelques minutes. Hadoop, Hive, Spark et Sqoop
peuvent prendre du temps au premier lancement.

## 14. Etat Final

Etat actuel:

```text
Kafka: implemente
Tracking frontend -> backend -> Kafka: implemente
Recommandations customer homepage: implemente
Seller analytics dashboard: implemente
Admin analytics live: implemente
Admin analytics Big Data: implemente
Hadoop/HDFS: implemente
Hive: implemente
Spark batch: implemente
Sqoop import/export: implemente
Batch automatique: implemente
Planification tous les 2 jours: implemente
Backend compile: OK
Frontend TypeScript: OK
Batch Big Data execute: OK
```

