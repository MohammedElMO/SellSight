package org.example.sellsight.product.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Product aggregate root — rich domain model.
 * Pure Java, no framework annotations.
 */
public class Product {

    private final ProductId id;
    private String name;
    private String description;
    private Money price;
    private String category;
    private final String sellerId;
    private String imageUrl;
    private boolean active;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product(ProductId id, String name, String description, Money price,
                   String category, String sellerId, String imageUrl,
                   boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = Objects.requireNonNull(id, "Product ID cannot be null");
        this.sellerId = Objects.requireNonNull(sellerId, "Seller ID cannot be null");
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt cannot be null");
        this.updatedAt = updatedAt;
        this.active = active;
        setName(name);
        setDescription(description);
        setPrice(price);
        setCategory(category);
        this.imageUrl = imageUrl;
    }

    // ── Business Methods ────────────────────────────────────────

    public void updateDetails(String name, String description, Money price,
                               String category, String imageUrl) {
        setName(name);
        setDescription(description);
        setPrice(price);
        setCategory(category);
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Validation ──────────────────────────────────────────────

    private void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        this.name = name.trim();
    }

    private void setDescription(String description) {
        this.description = description != null ? description.trim() : "";
    }

    private void setPrice(Money price) {
        this.price = Objects.requireNonNull(price, "Price cannot be null");
    }

    private void setCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category cannot be empty");
        }
        this.category = category.trim();
    }

    // ── Getters ─────────────────────────────────────────────────

    public ProductId getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Money getPrice() { return price; }
    public String getCategory() { return category; }
    public String getSellerId() { return sellerId; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return id.equals(product.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
