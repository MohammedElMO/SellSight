package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

public record InitiateAdmin2faSetupRequest(@NotBlank String setupToken) {}
