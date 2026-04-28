-- Enable pg_trgm for fuzzy / trigram matching on product names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on product name for fast trigram similarity lookups
CREATE INDEX IF NOT EXISTS products_name_trgm_idx
    ON products USING gin (name gin_trgm_ops);

-- GIN index on brand as well (autocomplete often includes brand)
CREATE INDEX IF NOT EXISTS products_brand_trgm_idx
    ON products USING gin (brand gin_trgm_ops);

-- Redis recently_viewed has no DB schema — managed purely via Redis keys.
