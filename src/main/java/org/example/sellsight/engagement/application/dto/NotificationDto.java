package org.example.sellsight.engagement.application.dto;

import java.time.LocalDateTime;

public record NotificationDto(
        String id,
        String type,
        String title,
        String body,
        String dataJson,
        boolean read,
        LocalDateTime createdAt
) {}
