package org.example.sellsight.engagement.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Review aggregate root — a customer's review of a product.
 * Rating 1–5, title + body, only one review per customer per product.
 */
public class Review {

    private final ReviewId id;
    private final String productId;
    private final String customerId;
    private int rating;
    private String title;
    private String body;
    private final boolean verifiedPurchase;
    private int helpfulCount;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Review(ReviewId id, String productId, String customerId,
                  int rating, String title, String body,
                  boolean verifiedPurchase, int helpfulCount,
                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = Objects.requireNonNull(id);
        this.productId = Objects.requireNonNull(productId);
        this.customerId = Objects.requireNonNull(customerId);
        this.verifiedPurchase = verifiedPurchase;
        this.helpfulCount = helpfulCount;
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = updatedAt;
        setRating(rating);
        setTitle(title);
        this.body = body;
    }

    // ── Business behaviour ──────────────────────────────────

    public void update(int rating, String title, String body) {
        setRating(rating);
        setTitle(title);
        this.body = body;
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementHelpful() {
        this.helpfulCount++;
    }

    public void decrementHelpful() {
        if (this.helpfulCount > 0) this.helpfulCount--;
    }

    // ── Validation ──────────────────────────────────────────

    private void setRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating;
    }

    private void setTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Review title cannot be empty");
        }
        if (title.length() > 200) {
            throw new IllegalArgumentException("Review title must be 200 characters or less");
        }
        this.title = title.trim();
    }

    // ── Getters ─────────────────────────────────────────────

    public ReviewId getId() { return id; }
    public String getProductId() { return productId; }
    public String getCustomerId() { return customerId; }
    public int getRating() { return rating; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public boolean isVerifiedPurchase() { return verifiedPurchase; }
    public int getHelpfulCount() { return helpfulCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id.equals(((Review) o).id);
    }

    @Override
    public int hashCode() { return id.hashCode(); }
}
