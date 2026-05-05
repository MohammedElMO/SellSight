package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BootstrapChangePasswordRequest(
        @NotBlank String setupToken,
        @NotBlank @Size(min = 12, max = 128,
                message = "Password must be at least 12 characters") String newPassword
) {}
