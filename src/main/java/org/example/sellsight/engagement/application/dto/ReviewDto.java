package org.example.sellsight.engagement.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewDto(
        String id,
        String productId,
        String customerId,
        String customerFirstName,
        String customerLastName,
        int rating,
        String title,
        String body,
        boolean verifiedPurchase,
        int helpfulCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<String> imageUrls
) {}
