package org.example.sellsight.product.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for product data returned in API responses.
 */
public record ProductDto(
        String id,
        String name,
        String description,
        BigDecimal price,
        String category,
        String sellerId,
        String imageUrl,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
