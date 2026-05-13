package org.example.sellsight.analytics.infrastructure.web.dto;

public record ConsumerRecommendationDto(
        String productId,
        String productName,
        long score,
        String reason
) {}