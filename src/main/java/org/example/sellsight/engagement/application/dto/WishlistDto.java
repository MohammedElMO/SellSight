package org.example.sellsight.engagement.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WishlistDto(
        String id,
        String userId,
        String name,
        boolean isDefault,
        List<WishlistItemDto> items,
        LocalDateTime createdAt
) {
    public record WishlistItemDto(
            Long id,
            String productId,
            String productName,
            String productImageUrl,
            double productPrice,
            LocalDateTime addedAt
    ) {}
}
