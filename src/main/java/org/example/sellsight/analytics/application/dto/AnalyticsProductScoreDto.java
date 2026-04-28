package org.example.sellsight.analytics.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnalyticsProductScoreDto(
        String productId,
        String productName,
        String sellerId,
        String category,
        long viewsCount,
        long clicksCount,
        long addToCartCount,
        long purchaseCount,
        BigDecimal revenue30d,
        BigDecimal score,
        LocalDateTime computedAt
) {}
