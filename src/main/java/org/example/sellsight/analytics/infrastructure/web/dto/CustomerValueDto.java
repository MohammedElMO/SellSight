package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;

public record CustomerValueDto(
        String customerId,
        String customerName,
        String email,
        Long orderCount,
        BigDecimal totalSpent,
        String lastOrderAt
) {}
