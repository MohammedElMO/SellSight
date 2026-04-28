package org.example.sellsight.user.application.dto;

import java.time.LocalDateTime;

/**
 * DTO for user profile data.
 */
public record UserDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        LocalDateTime createdAt,
        String avatarUrl
) {}
