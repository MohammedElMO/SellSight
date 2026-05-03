package org.example.sellsight.user.application.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangeRoleRequest(
        @NotBlank String role
) {}
