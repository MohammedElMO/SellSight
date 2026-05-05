package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnableTotpRequest(
        @NotBlank @Size(min = 6, max = 6) String code
) {}
