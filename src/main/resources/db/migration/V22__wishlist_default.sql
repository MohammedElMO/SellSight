ALTER TABLE wishlists ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- Only one default wishlist per user
CREATE UNIQUE INDEX uq_wishlists_user_default ON wishlists (user_id) WHERE is_default = TRUE;
