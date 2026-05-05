package org.example.sellsight.user.application.dto;

public record AdminManagementDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        boolean disabled,
        boolean deleted,
        boolean totpEnabled,
        boolean setupRequired,
        boolean setupApproved,
        boolean resetRequired,
        int failed2faAttempts,
        String last2faVerifiedAt,
        String createdAt,
        long activeSessionCount
) {}
