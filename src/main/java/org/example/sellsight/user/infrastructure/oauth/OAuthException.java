package org.example.sellsight.user.infrastructure.oauth;

/**
 * Thrown when an OAuth token exchange or user-info fetch fails.
 */
public class OAuthException extends RuntimeException {
    public OAuthException(String message) {
        super(message);
    }
}
