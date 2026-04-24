package org.example.sellsight.messaging.application.dto;

import java.time.LocalDateTime;

public record MessageDto(
        String id,
        String orderId,
        String senderId,
        String senderRole,
        String body,
        LocalDateTime sentAt
) {}
