package org.example.sellsight.analytics.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SellerAnalyticsSummaryDto(
        String sellerId,
        String sellerName,
        long viewsCount,
        long clicksCount,
        long addToCartCount,
        long purchaseCount,
        BigDecimal revenue30d,
        BigDecimal score,
        LocalDateTime computedAt
) {}
