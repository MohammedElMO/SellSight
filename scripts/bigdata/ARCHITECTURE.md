# Architecture Big Data SellSight - MapReduce + Hive

## 📐 Architecture Générale

```
PostgreSQL (OLTP)
    ↓
Sqoop Import (Snapshot/Incremental)
    ↓
HDFS Bronze Layer (Raw)
    ↓
Hive Transform (Bronze → Silver → Gold)
    ↓
MapReduce Jobs (Aggregations, Features, Scoring)
    ↓
HDFS Gold Layer (Serving)
    ↓
Sqoop Export → PostgreSQL Analytics Tables
    ↓
Backend API → Admin Seller/Consumer UI
```

## 🏗️ Composants Intégrés dans docker-compose.yml

### 1. **Hadoop HDFS** (Distributed Storage)
- **NameNode** (port 9870): Gère l'architecture du système de fichiers
- **DataNode** (port 9864): Stocke les données brutes/transformées
- Volumes: `/data/bronze`, `/data/silver`, `/data/gold`

### 2. **Hive** (SQL on Hadoop)
- Serveur Hive (port 10000): Exécute des requêtes HQL (HQL = Hadoop SQL)
- Metastore PostgreSQL: Stocke métadonnées des tables
- Accès via Beeline (client JDBC)

### 3. **Sqoop** (Batch Relational Bridge)
- Import: PostgreSQL → HDFS (snapshots/incrémental)
- Export: HDFS → PostgreSQL (résultats gold)
- Format: Parquet (compressé, optimisé)

---

## 📊 Pipeline de Données Étape par Étape

### Étape 1: Import des données (Sqoop)
```bash
# Snapshot products depuis PostgreSQL vers HDFS Bronze
docker exec sqoop bash -c "/opt/sqoop-scripts/import_snapshot.sh products"

# Output: /data/bronze/products/YYYYMMDD/part-*.parquet
```

**Ce qui se passe:**
- Sqoop lit la table `products` en PostgreSQL
- Exporte en Parquet (format colonnaire compressé, ~50% moins de stockage)
- 4 mappers parallèles (@num-mappers = 4) → rapid import

---

### Étape 2: Transformation Bronze → Silver (Hive)

**Fichier:** `scripts/bigdata/hive/bronze_to_silver.hql`

```hql
CREATE EXTERNAL TABLE bronze_products
STORED AS PARQUET
LOCATION '/data/bronze/products/';

CREATE TABLE silver_products AS
SELECT DISTINCT
  CAST(id AS BIGINT) as id,
  name,
  description,
  category,
  CAST(price AS DOUBLE) as price,  -- Convertir texte en nombre
  CAST(created_at AS TIMESTAMP) as created_at
FROM bronze_products;
```

**Nettoyage:**
- Typage: BIGINT, DOUBLE, TIMESTAMP (au lieu de STRING brut)
- Validation: regex pour prix/dates valides
- Déduplication: `SELECT DISTINCT`
- Résultat stocké en PARQUET compressé

---

### Étape 3: Agrégation Silver → Gold (Hive)

**Fichier:** `scripts/bigdata/hive/silver_to_gold.hql`

```hql
CREATE TABLE gold_product_scores AS
SELECT
  product_id,
  COUNT(CASE WHEN event='view' THEN 1) as views,
  COUNT(CASE WHEN event='add_to_cart' THEN 1) as carts,
  AVG(rating) as avg_rating,
  -- FORMULE DE SCORE PONDÉRÉE:
  views*0.2 + carts*0.5 + avg_rating*0.3 as popularity_score
FROM silver_events
GROUP BY product_id;
```

**Résultats (KPIs métier):**
- `views`: Nombre de vues produit
- `carts`: Ajouts au panier
- `avg_rating`: Note moyenne
- `popularity_score`: Score 0-100 combinant les 3

---

### Étape 4: MapReduce Job (Optional - Heavy Aggregations)

**Mapper** (`scripts/bigdata/mapreduce/popularity_mapper.py`):
```python
# Entrée: product_id\tevent_type\trating
# Sortie: product_id\tevent_type\trating (pass-through)
```

**Reducer** (`scripts/bigdata/mapreduce/popularity_reducer.py`):
```python
# Groupe par product_id, calcule agrégations
# Sortie: product_id\tviews\tcarts\tavg_rating\tscore
```

**Exécution:**
```bash
hadoop jar hadoop-streaming-*.jar \
  -input /data/silver/events \
  -output /data/gold/scores \
  -mapper popularity_mapper.py \
  -reducer popularity_reducer.py
```

---

### Étape 5: Export Gold → PostgreSQL (Sqoop)

```bash
docker exec sqoop bash -c "/opt/sqoop-scripts/export_gold.sh /data/gold/products_scores product_scores_gold"
```

**Résultat en Postgres:**
```sql
CREATE TABLE product_scores_gold (
  product_id BIGINT,
  views BIGINT,
  add_to_cart BIGINT,
  avg_rating DOUBLE,
  popularity_score DOUBLE
);
```

---

## 🎯 Utilisation dans Admin Seller/Consumer

### Cas 1: Seller Dashboard Analytics

**Endpoint API Backend (new):**
```java
GET /api/v1/sellers/{sellerId}/analytics/top-products
```

La requête:
```java
// Depuis la table gold_product_scores créée par Hive
SELECT p.id, p.name, s.popularity_score, s.views, s.add_to_cart
FROM silver_products p
JOIN product_scores_gold s ON p.id = s.product_id
WHERE p.seller_id = ? 
ORDER BY s.popularity_score DESC
LIMIT 10;
```

**Interface UI (Seller):**
```tsx
// sellsight-front/src/app/seller/dashboard/analytics.tsx
<AnalyticsChart 
  data={topProducts}  // Données venant de gold_product_scores
  metrics={['views', 'add_to_cart', 'popularity_score']}
/>
```

---

### Cas 2: Admin Consumer - Recommendations

**Hive Query pour recommandations basées sur popularité:**
```hql
SELECT 
  category,
  product_id,
  popularity_score,
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY popularity_score DESC) as rank
FROM gold_product_scores
WHERE rank <= 5  -- Top 5 per category
```

**Resultat:** Table `gold_category_top_products`

**Export → PostgreSQL → API → UI:**
```tsx
// sellsight-front/src/app/(customer)/products/recommendations.tsx
async function getRecommendations(category: string) {
  const res = await fetch(`/api/v1/recommendations?category=${category}`);
  // Backend query: SELECT * FROM gold_category_top_products WHERE category = ?
  return res.json();  
}
```

---

### Cas 3: User Insights (Consumer)

**Hive Query (User-based features):**
```hql
CREATE TABLE gold_user_features AS
SELECT
  user_id,
  COUNT(DISTINCT product_id) as products_views,
  COUNT(DISTINCT CASE WHEN event='add_to_cart' THEN product_id) as products_carted,
  COUNT(DISTINCT CASE WHEN event='purchase' THEN product_id) as products_purchased,
  AVG(rating) as avg_rating_given
FROM silver_events
GROUP BY user_id;
```

**Frontend:**
```tsx
// sellsight-front/src/app/(account)/profile/my-analytics.tsx
<div>
  <p>Produits vus: {userFeatures.products_views}</p>
  <p>Produits au panier: {userFeatures.products_carted}</p>
  <p>Produits achetés: {userFeatures.products_purchased}</p>
</div>
```

## 🎯 Cas d'Usage 2: Admin Seller Dashboard (avec MapReduce)

```sql
-- Query MapReduce results pour vendeur
SELECT 
  p.id,
  p.name,
  pp.popularity_score,
  pp.views,
  pp.add_to_cart,
  pp.avg_rating
FROM silver_products p
JOIN gold_product_popularity pp ON p.id = pp.product_id
WHERE p.seller_id = ?
ORDER BY pp.popularity_score DESC
LIMIT 10;
```

**UI affiche**:
```tsx
<div className="dashboard">
  <Chart 
    title="Top Produits par Score" 
    data={[
      {name: "Product A", score: 87.5, views: 1200, carts: 350},
      {name: "Product B", score: 76.2, views: 950, carts: 280},
    ]}
  />
  <Metrics
    totalViews={topProducts.map(p => p.views).sum()}
    totalCarts={topProducts.map(p => p.carts).sum()}
    avgScore={topProducts.map(p => p.score).avg()}
  />
</div>
```

---

## 🎯 Cas d'Usage 3: Consumer Recommendations (avec MapReduce)

```sql
-- Top products par category (from MapReduce output)
SELECT 
  category,
  top_products,
  trend_score
FROM gold_category_trends
WHERE trend_score > 50
ORDER BY trend_score DESC;
```

**Parsing top_products** (format: "prod_A(5000),prod_B(4800)"):
```tsx
const parseTopProducts = (topProductsStr: string) => {
  return topProductsStr.split(',').map(item => {
    const [prodId, views] = item.match(/(\w+)\((\d+)\)/).slice(1);
    return { productId: prodId, views: parseInt(views) };
  });
};

// Usage in Recommendations component
const trendingProducts = categoryTrends.top_products
  .then(parseTopProducts)
  .map(p => <ProductCard key={p.productId} id={p.productId} />);
```

---

## 🎯 Cas d'Usage 4: User Insights (avec MapReduce)

```sql
-- User shopping patterns (from MapReduce)
SELECT 
  user_id,
  products_viewed,
  products_carted,
  products_purchased,
  ROUND(CAST(products_purchased AS float) / products_carted, 2) AS conversion_rate,
  avg_rating_given,
  preferred_category
FROM gold_user_features
WHERE user_id = ?;
```

**Consumer Profile UI**:
```tsx
// sellsight-front/src/app/(account)/profile/insights.tsx
<div className="user-insights">
  <Statistics>
    <Stat label="Products Viewed" value={userFeatures.products_viewed} />
    <Stat label="Products Carted" value={userFeatures.products_carted} />
    <Stat label="Conversion Rate" value={conversionRate} percent />
    <Stat label="Avg Rating Given" value={userFeatures.avg_rating_given} star />
  </Statistics>
  
  <PreferredCategory 
    category={userFeatures.preferred_category}
    // Recommend similar products
  />
</div>
```

---

```bash
# 1. Lancer tous les services (incluant Big Data)
docker-compose up -d

# 2. Initialiser HDFS + Hive
bash scripts/bigdata/init-hadoop.sh

# 3. Import snapshot (tables principales)
docker exec sqoop bash -c "/opt/sqoop-scripts/import_snapshot.sh products"
docker exec sqoop bash -c "/opt/sqoop-scripts/import_snapshot.sh users"
docker exec sqoop bash -c "/opt/sqoop-scripts/import_snapshot.sh orders"

# 4. Transformer Bronze→Silver (Hive)
docker exec hive-server beeline -u 'jdbc:hive2://localhost:10000' \
  -f /opt/hive-scripts/bronze_to_silver.hql

# 5. Transformer Silver→Gold (agrégations Hive)
docker exec hive-server beeline -u 'jdbc:hive2://localhost:10000' \
  -f /opt/hive-scripts/silver_to_gold.hql

# 6. EXÉCUTER MAPREDUCE JOBS (NEW!)
bash scripts/bigdata/run-mapreduce.sh

# 7. Créer tables Hive sur sorties MapReduce
docker exec hive-server beeline -u 'jdbc:hive2://localhost:10000' \
  -f /opt/hive-scripts/gold_tables.hql

# 8. Exporter résultats gold vers PostgreSQL
docker exec sqoop bash -c "/opt/sqoop-scripts/export_gold.sh /data/gold/products_scores product_scores_gold"

# 9. Backend utilise les tables analytics
# - API queries on product_scores_gold
# - Frontend affiche dashboards seller/consumer
```

**OU Orchestration complète (one-shot):**
```bash
bash scripts/bigdata/run-pipeline.sh all
```

---

## 📈 Timeline des Données
```
Realtime (Kafka) → App Events → Stored in PostgreSQL
                                      ↓ (nuit/batch)
Batch (Sqoop) → Import 14k products + events → HDFS Bronze
                ↓ (Hive transform) 
           Silver (cleaned)
                ↓ (Hive aggregate)
           Gold (KPIs + scores)
                ↓ (Sqoop export)
           PostgreSQL Analytics Tables
                ↓
           API Endpoints
                ↓
           Admin UI (seller/consumer dashboards)
```

---

## 🔧 MapReduce Integration

MapReduce jobs process data in parallel across Hadoop cluster for heavy aggregations:

### Job 1: Product Popularity Scores
**Mapper** (`popularity_mapper.py`):
- Input: `/data/silver/events` (product_id\tevent_type\trating)
- Output: product_id as key, event_data as value

**Reducer** (`popularity_reducer.py`):
- Groups all events per product_id
- Calculates:
  - `views`: COUNT(event_type='view')
  - `add_to_cart`: COUNT(event_type='add_to_cart')
  - `purchase`: COUNT(event_type='purchase')
  - `avg_rating`: AVG(rating)
  - `popularity_score`: (views×0.2 + add_to_cart×0.5 + avg_rating×0.3)
- Output: `/data/gold/product_popularity_scores`

**Hive External Table**:
```sql
CREATE EXTERNAL TABLE gold_product_popularity
LOCATION '/data/gold/product_popularity_scores/';
```

---

### Job 2: User Features  
**Mapper** (`user_features_mapper.py`):
- Input: `/data/silver/user_events` (user_id\tevent_type\tproduct_id\trating)
- Groups by user_id

**Reducer** (`user_features_reducer.py`):
- Counts distinct products per event type
- Calculates:
  - `products_viewed`: DISTINCT COUNT(event='view')
  - `products_carted`: DISTINCT COUNT(event='add_to_cart')
  - `products_purchased`: DISTINCT COUNT(event='purchase')
  - `avg_rating_given`: AVG(rating)
  - `preferred_category`: MODE(category)
- Output: `/data/gold/user_features`

**Example Output**:
```
user_123	45	12	3	4.2	Electronics
user_456	120	35	8	3.8	Fashion
```

---

### Job 3: Category Trends
**Mapper** (`category_trends_mapper.py`):
- Input: `/data/silver/category_products` (category\tproduct_id\tevent_type\trating)
- Groups by category

**Reducer** (`category_trends_reducer.py`):
- Aggregates at category level:
  - `total_views`: SUM(views_per_product)
  - `total_carts`: SUM(carts_per_product)
  - `top_products`: Top 3 products by views with counts
  - `avg_rating`: AVG(ratings_in_category)
  - `trend_score`: (total_views×0.3 + total_carts×0.7) / num_products
- Output: `/data/gold/category_trends`

**Example Output**:
```
Electronics	45000	12000	prod_A(5000),prod_B(4800),prod_C(4200)	4.3	125.5
Fashion	32000	8500	prod_X(3200),prod_Y(3000),prod_Z(2800)	4.1	95.2
```

---

| Fichier | Purpose |
|---------|---------|
| `docker-compose.yml` | Services HDFS, Hive, Sqoop intégrés |
| `scripts/bigdata/sqoop/*.sh` | Import/Export Sqoop |
| `scripts/bigdata/hive/*.hql` | Transformations Hive |
| `scripts/bigdata/mapreduce/*.py` | MapReduce jobs |
| `scripts/bigdata/init-hadoop.sh` | Setup HDFS + Hive |

---

## Résumé

- **HDFS** = DataLake (Bronze/Silver/Gold)
- **Hive** = SQL-like transformations sur Hadoop
- **Sqoop** = Sync PostgreSQL ↔ HDFS
- **MapReduce** = Heavy filtering/aggregations
- **PostgreSQL Gold Tables** = Serving layer pour API/UI
- **Admin/Consumer UI** = Affiche analytics, recommandations, insights

Toutes les tables gold sont finalement synchronisées en PostgreSQL → utilisables comme des tables normales par le backend.

