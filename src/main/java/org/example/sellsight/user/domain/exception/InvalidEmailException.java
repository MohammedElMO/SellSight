package org.example.sellsight.user.domain.exception;

/**
 * Thrown when an email fails format validation.
 */
public class InvalidEmailException extends RuntimeException {
    public InvalidEmailException(String message) {
        super(message);
    }
}
