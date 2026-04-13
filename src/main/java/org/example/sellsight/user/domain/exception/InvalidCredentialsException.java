package org.example.sellsight.user.domain.exception;

/**
 * Thrown when login credentials (email/password) are invalid.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
