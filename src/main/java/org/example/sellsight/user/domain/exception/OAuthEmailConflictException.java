package org.example.sellsight.user.domain.exception;

/**
 * Thrown when an OAuth sign-in arrives for an email that already has a
 * different provider bound. The use case may choose to link or reject.
 */
public class OAuthEmailConflictException extends RuntimeException {
    public OAuthEmailConflictException(String message) { super(message); }
}
