package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for OAuth2 login — frontend sends the authorization code
 * and the provider name, backend exchanges it for user info.
 */
public record OAuthLoginRequest(
        @NotBlank String provider,       // "GOOGLE" or "SLACK"
        @NotBlank String code,           // authorization code from provider
        @NotBlank String redirectUri     // must match what was sent to the provider
) {}
