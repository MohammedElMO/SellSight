package org.example.sellsight.product.domain.exception;

/**
 * Thrown when a user tries to modify a product they don't own.
 */
public class UnauthorizedProductAccessException extends RuntimeException {
    public UnauthorizedProductAccessException() {
        super("You are not authorized to modify this product");
    }
}
