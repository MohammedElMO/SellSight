package org.example.sellsight.order.application.dto;

import java.time.LocalDateTime;

public record RefundRequestDto(
        String id,
        String orderId,
        String customerId,
        String reason,
        String status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {}
