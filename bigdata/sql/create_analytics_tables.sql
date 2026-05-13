CREATE TABLE IF NOT EXISTS analytics_daily_sales (
    sales_day DATE PRIMARY KEY,
    order_count BIGINT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_top_products (
    product_id VARCHAR(255) PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(255),
    units_sold BIGINT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_event_funnel (
    event_type VARCHAR(50) PRIMARY KEY,
    event_count BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_category_sales (
    category VARCHAR(255) PRIMARY KEY,
    order_count BIGINT NOT NULL,
    units_sold BIGINT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_seller_performance (
    seller_id VARCHAR(255) PRIMARY KEY,
    seller_name VARCHAR(255),
    product_count BIGINT NOT NULL,
    order_count BIGINT NOT NULL,
    units_sold BIGINT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_inventory_risk (
    product_id VARCHAR(255) PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(255),
    seller_id VARCHAR(255),
    stock_quantity BIGINT NOT NULL,
    reorder_threshold BIGINT NOT NULL,
    units_sold BIGINT NOT NULL,
    view_count BIGINT NOT NULL,
    risk_score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_monthly_sales (
    sales_month VARCHAR(7) PRIMARY KEY,
    order_count BIGINT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_customer_value (
    customer_id VARCHAR(255) PRIMARY KEY,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    order_count BIGINT NOT NULL,
    total_spent NUMERIC(12, 2) NOT NULL,
    last_order_at VARCHAR(50)
);
