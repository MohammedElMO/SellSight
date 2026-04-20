package org.example.sellsight.engagement.domain.model;

import java.time.LocalDateTime;

/** Value object representing one product in a wishlist. */
public record WishlistItem(Long id, String productId, LocalDateTime addedAt) {
    public WishlistItem {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Product ID cannot be empty");
        }
    }
}
