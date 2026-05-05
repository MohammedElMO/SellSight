package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

public record Verify2faRequest(
        @NotBlank String challengeToken,
        @NotBlank String code
) {}
