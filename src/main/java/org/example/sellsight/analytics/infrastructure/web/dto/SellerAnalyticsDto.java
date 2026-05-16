package org.example.sellsight.analytics.infrastructure.web.dto;

import java.util.List;

public record SellerAnalyticsDto(
        int days,
        long totalViews,
        long totalAddToCarts,
        long totalPurchases,
        double viewToCartRate,
        double viewToPurchaseRate,
        List<SellerProductAnalyticsDto> products
) {
}
