from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, countDistinct, date_format, desc, sum as sum_


spark = (
    SparkSession.builder
    .appName("SellSightAnalyticsBatch")
    .enableHiveSupport()
    .getOrCreate()
)

orders = spark.table("sellsight_raw.orders")
order_items = spark.table("sellsight_raw.order_items")
products = spark.table("sellsight_raw.products")
events = spark.table("sellsight_raw.user_events")
inventory = spark.table("sellsight_raw.inventory")
users = spark.table("sellsight_raw.users")

daily_sales = (
    orders
    .join(order_items, orders.id == order_items.order_id, "left")
    .withColumn("sales_day", date_format(orders.created_at, "yyyy-MM-dd"))
    .groupBy("sales_day")
    .agg(
        countDistinct(orders.id).alias("order_count"),
        sum_(col("quantity") * col("unit_price")).alias("revenue")
    )
    .orderBy("sales_day")
)

top_products = (
    order_items
    .join(products, order_items.product_id == products.id, "left")
    .groupBy(
        order_items.product_id.alias("product_id"),
        products.name.alias("product_name"),
        products.category.alias("category")
    )
    .agg(
        sum_("quantity").alias("units_sold"),
        sum_(col("quantity") * col("unit_price")).alias("revenue")
    )
    .orderBy(desc("revenue"))
)

event_funnel = (
    events
    .groupBy("event_type")
    .agg(count("id").alias("event_count"))
    .orderBy(desc("event_count"))
)

orders.createOrReplaceTempView("orders")
order_items.createOrReplaceTempView("order_items")
products.createOrReplaceTempView("products")
events.createOrReplaceTempView("user_events")
inventory.createOrReplaceTempView("inventory")
users.createOrReplaceTempView("users")

category_sales = spark.sql("""
    SELECT
      COALESCE(p.category, 'Uncategorized') AS category,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(oi.quantity), 0) AS units_sold,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.status <> 'CANCELLED'
    GROUP BY COALESCE(p.category, 'Uncategorized')
    ORDER BY revenue DESC, units_sold DESC
""")

seller_performance = spark.sql("""
    SELECT
      p.seller_id,
      COALESCE(MAX(CONCAT(u.first_name, ' ', u.last_name)), MAX(p.seller_id)) AS seller_name,
      COUNT(DISTINCT p.id) AS product_count,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) AS units_sold,
      COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity * oi.unit_price ELSE 0 END), 0) AS revenue
    FROM products p
    LEFT JOIN users u ON u.id = p.seller_id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'CANCELLED'
    WHERE p.seller_id IS NOT NULL
    GROUP BY p.seller_id
    ORDER BY revenue DESC, units_sold DESC
""")

inventory_risk = spark.sql("""
    WITH sales AS (
      SELECT
        oi.product_id,
        COALESCE(SUM(oi.quantity), 0) AS units_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id AND o.status <> 'CANCELLED'
      GROUP BY oi.product_id
    ),
    views AS (
      SELECT
        product_id,
        COUNT(*) AS view_count
      FROM user_events
      WHERE event_type = 'VIEW' AND product_id IS NOT NULL
      GROUP BY product_id
    )
    SELECT
      i.product_id,
      p.name AS product_name,
      p.category,
      p.seller_id,
      COALESCE(i.quantity, 0) AS stock_quantity,
      COALESCE(i.reorder_threshold, 0) AS reorder_threshold,
      COALESCE(s.units_sold, 0) AS units_sold,
      COALESCE(v.view_count, 0) AS view_count,
      CASE
        WHEN COALESCE(i.quantity, 0) <= COALESCE(i.reorder_threshold, 0) THEN 100
        WHEN COALESCE(i.quantity, 0) <= COALESCE(i.reorder_threshold, 0) * 2 THEN 70
        WHEN COALESCE(s.units_sold, 0) >= COALESCE(i.quantity, 0) THEN 50
        ELSE 20
      END AS risk_score
    FROM inventory i
    LEFT JOIN products p ON p.id = i.product_id
    LEFT JOIN sales s ON s.product_id = i.product_id
    LEFT JOIN views v ON v.product_id = i.product_id
    ORDER BY risk_score DESC, units_sold DESC, view_count DESC
""")

monthly_sales = spark.sql("""
    SELECT
      date_format(o.created_at, 'yyyy-MM') AS sales_month,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status <> 'CANCELLED'
    GROUP BY date_format(o.created_at, 'yyyy-MM')
    ORDER BY sales_month
""")

customer_value = spark.sql("""
    SELECT
      o.customer_id,
      COALESCE(MAX(CONCAT(u.first_name, ' ', u.last_name)), MAX(o.customer_id)) AS customer_name,
      MAX(u.email) AS email,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_spent,
      MAX(o.created_at) AS last_order_at
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status <> 'CANCELLED'
      AND o.customer_id IS NOT NULL
    GROUP BY o.customer_id
    ORDER BY total_spent DESC, order_count DESC
""")

spark.sql("CREATE DATABASE IF NOT EXISTS sellsight_analytics")

daily_sales.write.mode("overwrite").saveAsTable("sellsight_analytics.daily_sales")
top_products.write.mode("overwrite").saveAsTable("sellsight_analytics.top_products")
event_funnel.write.mode("overwrite").saveAsTable("sellsight_analytics.event_funnel")
category_sales.write.mode("overwrite").saveAsTable("sellsight_analytics.category_sales")
seller_performance.write.mode("overwrite").saveAsTable("sellsight_analytics.seller_performance")
inventory_risk.write.mode("overwrite").saveAsTable("sellsight_analytics.inventory_risk")
monthly_sales.write.mode("overwrite").saveAsTable("sellsight_analytics.monthly_sales")
customer_value.write.mode("overwrite").saveAsTable("sellsight_analytics.customer_value")

csv_options = {"header": "false", "sep": "\001", "quote": "\u0000", "escape": "\u0000"}

daily_sales.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/daily_sales")
top_products.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/top_products")
event_funnel.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/event_funnel")
category_sales.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/category_sales")
seller_performance.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/seller_performance")
inventory_risk.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/inventory_risk")
monthly_sales.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/monthly_sales")
customer_value.coalesce(1).write.mode("overwrite").options(**csv_options).csv("/data/processed/customer_value")

spark.stop()
