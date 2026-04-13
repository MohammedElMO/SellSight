package org.example.sellsight.inventory.domain.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String productId, int available, int requested) {
        super("Insufficient stock for product " + productId + ": available=" + available + ", requested=" + requested);
    }
}
