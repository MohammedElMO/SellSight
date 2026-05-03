package org.example.sellsight.order.domain.model;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Entity within the Order aggregate — represents a single line item.
 */
public class OrderItem {

    private final String productId;
    private final String productName;
    private final String sellerId;
    private final int quantity;
    private final BigDecimal unitPrice;

    public OrderItem(String productId, String productName, String sellerId,
                     int quantity, BigDecimal unitPrice) {
        this.productId = Objects.requireNonNull(productId, "Product ID cannot be null");
        this.productName = Objects.requireNonNull(productName, "Product name cannot be null");
        this.sellerId = Objects.requireNonNull(sellerId, "Seller ID cannot be null");
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = quantity;
        this.unitPrice = Objects.requireNonNull(unitPrice, "Unit price cannot be null");
        if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Unit price cannot be negative");
        }
    }

    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getSellerId() { return sellerId; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
