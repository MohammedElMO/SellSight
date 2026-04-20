-- Additional partial indexes for filter + sort combinations on 10M+ rows.
-- All scoped to active=true to keep index size minimal.

-- Restore V4 columns lost when products table was manually recreated.
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sold_count    INTEGER        NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_avg    NUMERIC(3, 2)  NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS rating_count  INTEGER        NOT NULL DEFAULT 0;

-- 'best_selling' sort
CREATE INDEX IF NOT EXISTS idx_products_active_sold
    ON products (sold_count DESC) WHERE active = true;

-- category + price for price_asc / price_desc sort under a category filter
CREATE INDEX IF NOT EXISTS idx_products_category_price
    ON products (category, price ASC) WHERE active = true;

-- category + rating for 'rating' sort under a category filter
CREATE INDEX IF NOT EXISTS idx_products_category_rating
    ON products (category, rating_avg DESC) WHERE active = true;
