package org.example.sellsight.analytics.infrastructure.web.dto;

public record SellerProductAnalyticsDto(
        String productId,
        String productName,
        String imageUrl,
        boolean active,
        long views,
        long addToCarts,
        long purchases,
        double viewToCartRate,
        double viewToPurchaseRate
) {
}
