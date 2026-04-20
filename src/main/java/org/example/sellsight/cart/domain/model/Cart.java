package org.example.sellsight.cart.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class Cart {

    private final String id;
    private final String userId;
    private final List<CartItem> items;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Cart(String id, String userId, List<CartItem> items,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.userId = userId;
        this.items = new ArrayList<>(items != null ? items : List.of());
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    public static Cart empty(String userId) {
        return new Cart(UUID.randomUUID().toString(), userId, List.of(),
                LocalDateTime.now(), null);
    }

    public void addOrUpdateItem(String productId, int quantity) {
        Optional<CartItem> existing = items.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            items.add(new CartItem(productId, quantity));
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void updateItem(String productId, int quantity) {
        items.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(quantity));
        this.updatedAt = LocalDateTime.now();
    }

    public void removeItem(String productId) {
        items.removeIf(i -> i.getProductId().equals(productId));
        this.updatedAt = LocalDateTime.now();
    }

    public void clear() {
        items.clear();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public List<CartItem> getItems() { return Collections.unmodifiableList(items); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
