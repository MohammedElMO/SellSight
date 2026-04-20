-- Performance fixes for product listing on 10M+ rows.
-- 1. Composite sort + id tiebreakers so ORDER BY can be served from the index
--    without a re-sort step.
-- 2. ANALYZE so the planner has fresh stats after bulk loads.

-- newest sort (covered by idx_products_active in V10, kept for explicitness)

-- best_selling sort, with id tiebreaker
CREATE INDEX IF NOT EXISTS idx_products_active_sold_id
    ON products (sold_count DESC, id DESC) WHERE active = true;

-- rating sort, with id tiebreaker
CREATE INDEX IF NOT EXISTS idx_products_active_rating_id
    ON products (rating_avg DESC, id DESC) WHERE active = true;

-- price_desc sort, with id tiebreaker
CREATE INDEX IF NOT EXISTS idx_products_active_price_desc_id
    ON products (price DESC, id DESC) WHERE active = true;

-- price_asc sort — matches Sort.by(ASC, price).and(DESC, id)
CREATE INDEX IF NOT EXISTS idx_products_active_price_asc_id
    ON products (price ASC, id DESC) WHERE active = true;

-- Seller listings tiebreaker
CREATE INDEX IF NOT EXISTS idx_products_seller_created_id
    ON products (seller_id, created_at DESC, id DESC) WHERE active = true;

-- Category listings tiebreaker
CREATE INDEX IF NOT EXISTS idx_products_category_created_id
    ON products (category, created_at DESC, id DESC) WHERE active = true;

-- Refresh planner stats after bulk loads. Cheap and crucial.
ANALYZE products;
