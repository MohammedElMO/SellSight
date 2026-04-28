package org.example.sellsight.analytics.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecommendationDto(
        String productId,
        String productName,
        String category,
        String reason,
        BigDecimal score,
        LocalDateTime createdAt
) {}
