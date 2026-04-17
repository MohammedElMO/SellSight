package org.example.sellsight.product.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing a unique product identifier.
 * Wraps a String to support both standard UUIDs (catalogue products)
 * and external dataset IDs (numeric strings, long UUIDs) that arrive
 * via the event-streaming pipeline.
 */
public final class ProductId {

    private final String value;

    private ProductId(String value) {
        this.value = Objects.requireNonNull(value, "ProductId cannot be null");
    }

    /** Creates a new UUID-based identifier for catalogue products. */
    public static ProductId generate() {
        return new ProductId(UUID.randomUUID().toString());
    }

    /**
     * Creates an identifier from an existing string.
     * Accepts any non-blank string — including numeric IDs from external datasets.
     */
    public static ProductId from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("ProductId cannot be blank");
        }
        return new ProductId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductId that = (ProductId) o;
        return value.equals(that.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }

    @Override
    public String toString() {
        return value;
    }
}
