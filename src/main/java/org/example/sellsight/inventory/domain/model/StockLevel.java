package org.example.sellsight.inventory.domain.model;

import java.util.Objects;

/**
 * Value Object representing a non-negative stock level.
 * Throws on underflow attempts.
 */
public final class StockLevel {

    private final int quantity;

    public StockLevel(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Stock level cannot be negative: " + quantity);
        }
        this.quantity = quantity;
    }

    public static StockLevel of(int quantity) {
        return new StockLevel(quantity);
    }

    public static StockLevel zero() {
        return new StockLevel(0);
    }

    public StockLevel decrease(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("Decrease amount must be positive");
        if (this.quantity < amount) {
            throw new IllegalArgumentException(
                    "Insufficient stock: available=" + this.quantity + ", requested=" + amount);
        }
        return new StockLevel(this.quantity - amount);
    }

    public StockLevel increase(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("Increase amount must be positive");
        return new StockLevel(this.quantity + amount);
    }

    public int getQuantity() { return quantity; }

    public boolean isLow(int threshold) {
        return quantity <= threshold;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return quantity == ((StockLevel) o).quantity;
    }

    @Override public int hashCode() { return Objects.hash(quantity); }
    @Override public String toString() { return String.valueOf(quantity); }
}
