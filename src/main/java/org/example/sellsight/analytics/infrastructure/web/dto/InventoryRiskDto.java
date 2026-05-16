package org.example.sellsight.analytics.infrastructure.web.dto;

public record InventoryRiskDto(
        String productId,
        String productName,
        String category,
        String sellerId,
        Long stockQuantity,
        Long reorderThreshold,
        Long unitsSold,
        Long viewCount,
        Integer riskScore
) {}
