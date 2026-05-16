package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;

public record MonthlySalesDto(
        String salesMonth,
        Long orderCount,
        BigDecimal revenue
) {}
