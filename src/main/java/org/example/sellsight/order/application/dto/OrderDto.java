package org.example.sellsight.order.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        String id,
        String customerId,
        List<OrderItemDto> items,
        BigDecimal total,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
