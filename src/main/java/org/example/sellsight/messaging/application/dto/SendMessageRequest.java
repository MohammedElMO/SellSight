package org.example.sellsight.messaging.application.dto;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        @NotBlank String body
) {}
