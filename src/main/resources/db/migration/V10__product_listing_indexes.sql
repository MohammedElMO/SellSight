-- Partial indexes for product listing queries on 10M+ rows.
-- Only index active rows to keep index size small.

CREATE INDEX IF NOT EXISTS idx_products_active
    ON products (created_at DESC, id DESC)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_seller_active
    ON products (seller_id, created_at DESC)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_active
    ON products (category, created_at DESC)
    WHERE active = true;

-- Composite indexes for filter queries (price/rating range scans)
CREATE INDEX IF NOT EXISTS idx_products_active_price
    ON products (price)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_active_rating
    ON products (rating_avg DESC)
    WHERE active = true;
