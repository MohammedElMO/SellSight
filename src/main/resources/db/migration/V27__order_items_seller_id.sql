-- =============================================================
-- V27: Add seller_id to order_items for seller-scoped queries
-- =============================================================

ALTER TABLE order_items ADD COLUMN seller_id VARCHAR(36);

-- Backfill seller_id from products table where match exists
UPDATE order_items oi
SET seller_id = (SELECT p.seller_id FROM products p WHERE p.id = oi.product_id)
WHERE EXISTS (SELECT 1 FROM products p WHERE p.id = oi.product_id);

-- Handle orphaned order items (product deleted) with a placeholder
UPDATE order_items
SET seller_id = 'UNKNOWN'
WHERE seller_id IS NULL;

-- Now safe to set NOT NULL
ALTER TABLE order_items ALTER COLUMN seller_id SET NOT NULL;

-- Index for seller-scoped order queries
CREATE INDEX idx_order_items_seller ON order_items(seller_id);
