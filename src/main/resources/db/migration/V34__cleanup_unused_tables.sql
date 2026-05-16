-- Drop tables that were scaffolded in V4 but are never used by any application code.
-- The codebase uses products.image_url (single URL) and has no variant logic.
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
