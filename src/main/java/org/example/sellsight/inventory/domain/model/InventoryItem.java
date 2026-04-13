package org.example.sellsight.inventory.domain.model;

import java.util.Objects;

/**
 * Inventory aggregate root — tracks stock for a product.
 */
public class InventoryItem {

    private final String productId;
    private StockLevel stockLevel;
    private int reorderThreshold;

    public InventoryItem(String productId, StockLevel stockLevel, int reorderThreshold) {
        this.productId = Objects.requireNonNull(productId, "Product ID cannot be null");
        this.stockLevel = Objects.requireNonNull(stockLevel, "Stock level cannot be null");
        if (reorderThreshold < 0) {
            throw new IllegalArgumentException("Reorder threshold cannot be negative");
        }
        this.reorderThreshold = reorderThreshold;
    }

    public void decreaseStock(int amount) {
        this.stockLevel = stockLevel.decrease(amount);
    }

    public void increaseStock(int amount) {
        this.stockLevel = stockLevel.increase(amount);
    }

    public void setReorderThreshold(int threshold) {
        if (threshold < 0) throw new IllegalArgumentException("Threshold cannot be negative");
        this.reorderThreshold = threshold;
    }

    public boolean isLowStock() {
        return stockLevel.isLow(reorderThreshold);
    }

    public String getProductId() { return productId; }
    public StockLevel getStockLevel() { return stockLevel; }
    public int getReorderThreshold() { return reorderThreshold; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return productId.equals(((InventoryItem) o).productId);
    }

    @Override public int hashCode() { return productId.hashCode(); }
}
