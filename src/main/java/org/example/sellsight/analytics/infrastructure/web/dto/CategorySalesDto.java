package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;

public record CategorySalesDto(
        String category,
        Long orderCount,
        Long unitsSold,
        BigDecimal revenue
) {}
