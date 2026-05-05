package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

public record DisableTotpRequest(@NotBlank String code) {}
