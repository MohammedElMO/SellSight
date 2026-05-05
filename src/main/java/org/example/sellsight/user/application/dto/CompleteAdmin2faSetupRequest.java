package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

public record CompleteAdmin2faSetupRequest(@NotBlank String setupToken, @NotBlank String code) {}
