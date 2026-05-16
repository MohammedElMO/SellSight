package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HistoricalDailySalesDto(
        LocalDate salesDay,
        Long orderCount,
        BigDecimal revenue
) {}
