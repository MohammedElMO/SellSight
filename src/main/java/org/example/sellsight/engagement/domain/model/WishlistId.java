package org.example.sellsight.engagement.domain.model;

import java.util.Objects;
import java.util.UUID;

/** Value object — strongly-typed wishlist identifier. */
public record WishlistId(UUID value) {
    public WishlistId {
        Objects.requireNonNull(value, "WishlistId cannot be null");
    }

    public static WishlistId generate() {
        return new WishlistId(UUID.randomUUID());
    }

    public static WishlistId of(UUID value) {
        return new WishlistId(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
