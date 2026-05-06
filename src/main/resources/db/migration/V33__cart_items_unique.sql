-- Prevent duplicate cart entries for the same product in the same cart.
-- The domain model already enforces this via addOrUpdateItem(), but a race condition
-- (two concurrent POST /api/cart/items requests before either commits) could bypass it.
ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_cart_product_unique UNIQUE (cart_id, product_id);
