-- V18__bigdata_serving.sql
-- Postgres serving layer for the Hadoop batch pipeline.
-- The batch jobs write their final gold results here via Sqoop export.

CREATE TABLE product_trend_scores (
    product_id          VARCHAR(255)    NOT NULL,
    seller_id           VARCHAR(255)    NOT NULL,
    category            VARCHAR(255)    NOT NULL,
    views_count         BIGINT          NOT NULL DEFAULT 0,
    clicks_count        BIGINT          NOT NULL DEFAULT 0,
    add_to_cart_count   BIGINT          NOT NULL DEFAULT 0,
    purchase_count      BIGINT          NOT NULL DEFAULT 0,
    revenue_30d         NUMERIC(12,2)   NOT NULL DEFAULT 0,
    score               NUMERIC(12,4)   NOT NULL DEFAULT 0,
    computed_at         TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_product_trend_scores PRIMARY KEY (product_id),
    CONSTRAINT fk_pts_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_pts_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_pts_score ON product_trend_scores (score DESC, purchase_count DESC, views_count DESC);
CREATE INDEX idx_pts_seller ON product_trend_scores (seller_id);
CREATE INDEX idx_pts_category ON product_trend_scores (category);

CREATE TABLE seller_trend_scores (
    seller_id           VARCHAR(255)    NOT NULL,
    views_count         BIGINT          NOT NULL DEFAULT 0,
    clicks_count        BIGINT          NOT NULL DEFAULT 0,
    add_to_cart_count   BIGINT          NOT NULL DEFAULT 0,
    purchase_count      BIGINT          NOT NULL DEFAULT 0,
    revenue_30d         NUMERIC(12,2)   NOT NULL DEFAULT 0,
    score               NUMERIC(12,4)   NOT NULL DEFAULT 0,
    computed_at         TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_seller_trend_scores PRIMARY KEY (seller_id),
    CONSTRAINT fk_sts_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_sts_score ON seller_trend_scores (score DESC, purchase_count DESC, revenue_30d DESC);

CREATE TABLE analytics_batch_runs (
    id               UUID            NOT NULL DEFAULT gen_random_uuid(),
    pipeline_name     VARCHAR(100)    NOT NULL,
    source_system     VARCHAR(100)    NOT NULL,
    bronze_loaded_at  TIMESTAMP(6),
    silver_loaded_at  TIMESTAMP(6),
    gold_loaded_at    TIMESTAMP(6),
    status            VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    details_json      JSONB,
    created_at        TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP(6),
    CONSTRAINT pk_analytics_batch_runs PRIMARY KEY (id)
);

CREATE INDEX idx_analytics_runs_pipeline ON analytics_batch_runs (pipeline_name, created_at DESC);
