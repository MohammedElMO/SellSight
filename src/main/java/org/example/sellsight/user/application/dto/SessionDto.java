package org.example.sellsight.user.application.dto;

import java.time.Instant;

public record SessionDto(
        String id,
        String userId,
        String userEmail,
        String deviceInfo,
        String ipAddress,
        String userAgent,
        Instant createdAt,
        Instant lastUsedAt,
        Instant expiresAt,
        Instant revokedAt,
        String status,
        String tokenFamilyId
) {}
