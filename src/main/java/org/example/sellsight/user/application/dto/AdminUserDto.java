package org.example.sellsight.user.application.dto;

import java.time.LocalDateTime;

public record AdminUserDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        LocalDateTime createdAt,
        String avatarUrl,
        boolean emailVerified,
        String sellerStatus,
        String authProvider,
        boolean disabled,
        boolean deleted,
        LocalDateTime deletedAt,
        long activeSessionCount
) {}
