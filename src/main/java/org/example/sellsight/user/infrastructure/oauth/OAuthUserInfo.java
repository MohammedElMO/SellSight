package org.example.sellsight.user.infrastructure.oauth;

/**
 * Normalized user info returned from any OAuth provider.
 */
public record OAuthUserInfo(
        String providerId,
        String email,
        String firstName,
        String lastName
) {}
