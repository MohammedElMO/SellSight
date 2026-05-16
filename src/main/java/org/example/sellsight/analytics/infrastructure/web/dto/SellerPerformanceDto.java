package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;

public record SellerPerformanceDto(
        String sellerId,
        String sellerName,
        Long productCount,
        Long orderCount,
        Long unitsSold,
        BigDecimal revenue
) {}
