-- Composite indexes for category + sort combinations.
-- Without these, a category filter + non-default sort requires a re-sort step after the category index scan.

CREATE INDEX IF NOT EXISTS idx_products_category_price_desc_id
    ON products (category, price DESC, id DESC)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_price_asc_id
    ON products (category, price ASC, id DESC)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_rating_id
    ON products (category, rating_avg DESC, id DESC)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_sold_id
    ON products (category, sold_count DESC, id DESC)
    WHERE active = true;

-- Refresh planner stats so the new indexes are used immediately.
ANALYZE products;
ANALYZE inventory;
