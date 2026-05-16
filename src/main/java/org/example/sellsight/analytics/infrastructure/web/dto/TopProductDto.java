package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;

public record TopProductDto(
        String productId,
        String productName,
        String imageUrl,
        Long unitsSold,
        BigDecimal revenue,
        Long views,
        Long addToCarts,
        Long purchases,
        double viewToPurchaseRate
) {}
