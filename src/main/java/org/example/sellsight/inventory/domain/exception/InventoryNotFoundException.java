package org.example.sellsight.inventory.domain.exception;

public class InventoryNotFoundException extends RuntimeException {
    public InventoryNotFoundException(String productId) {
        super("Inventory not found for product: " + productId);
    }
}
