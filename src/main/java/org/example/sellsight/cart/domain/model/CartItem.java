package org.example.sellsight.cart.domain.model;

import java.time.LocalDateTime;

public class CartItem {

    private final Long id;
    private final String productId;
    private int quantity;
    private boolean savedForLater;
    private final LocalDateTime addedAt;

    public CartItem(Long id, String productId, int quantity,
                    boolean savedForLater, LocalDateTime addedAt) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.savedForLater = savedForLater;
        this.addedAt = addedAt != null ? addedAt : LocalDateTime.now();
    }

    public CartItem(String productId, int quantity) {
        this(null, productId, quantity, false, LocalDateTime.now());
    }

    public void setQuantity(int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public boolean isSavedForLater() { return savedForLater; }
    public LocalDateTime getAddedAt() { return addedAt; }
}
