package org.example.sellsight.product.domain.exception;

/**
 * Thrown when a product is not found.
 */
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String productId) {
        super("Product not found: " + productId);
    }
}
