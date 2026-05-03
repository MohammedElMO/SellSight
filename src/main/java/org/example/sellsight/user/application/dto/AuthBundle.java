package org.example.sellsight.user.application.dto;

/**
 * Bundles an AuthResponse (for the HTTP body) with a raw refresh token
 * (to be set as an HttpOnly cookie). Never expose rawRefreshToken in the response body.
 */
public record AuthBundle(AuthResponse authResponse, String rawRefreshToken) {}
