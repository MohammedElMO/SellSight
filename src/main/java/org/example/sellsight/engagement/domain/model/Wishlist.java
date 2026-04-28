package org.example.sellsight.engagement.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Wishlist aggregate root — a named list of products a customer wants to buy later.
 * Users can have multiple wishlists.
 */
public class Wishlist {

    private final WishlistId id;
    private final String userId;
    private String name;
    private boolean isDefault;
    private final List<WishlistItem> items;
    private final LocalDateTime createdAt;

    public Wishlist(WishlistId id, String userId, String name,
                    boolean isDefault, List<WishlistItem> items, LocalDateTime createdAt) {
        this.id = Objects.requireNonNull(id);
        this.userId = Objects.requireNonNull(userId);
        this.isDefault = isDefault;
        this.items = new ArrayList<>(items != null ? items : List.of());
        this.createdAt = Objects.requireNonNull(createdAt);
        setName(name);
    }

    // ── Business behaviour ──────────────────────────────────

    public void addProduct(String productId) {
        boolean exists = items.stream()
                .anyMatch(i -> i.productId().equals(productId));
        if (exists) return; // idempotent
        items.add(new WishlistItem(null, productId, LocalDateTime.now()));
    }

    public void removeProduct(String productId) {
        items.removeIf(i -> i.productId().equals(productId));
    }

    public boolean containsProduct(String productId) {
        return items.stream().anyMatch(i -> i.productId().equals(productId));
    }

    public void rename(String newName) {
        setName(newName);
    }

    public void markAsDefault() { this.isDefault = true; }
    public void unmarkAsDefault() { this.isDefault = false; }

    // ── Validation ──────────────────────────────────────────

    private void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Wishlist name cannot be empty");
        }
        if (name.length() > 100) {
            throw new IllegalArgumentException("Wishlist name must be 100 characters or less");
        }
        this.name = name.trim();
    }

    // ── Getters ─────────────────────────────────────────────

    public WishlistId getId() { return id; }
    public String getUserId() { return userId; }
    public String getName() { return name; }
    public boolean isDefault() { return isDefault; }
    public List<WishlistItem> getItems() { return Collections.unmodifiableList(items); }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id.equals(((Wishlist) o).id);
    }

    @Override
    public int hashCode() { return id.hashCode(); }
}
