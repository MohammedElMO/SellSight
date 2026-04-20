package org.example.sellsight.cart.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CartDto(
        String id,
        String userId,
        List<CartItemDto> items
) {
    public record CartItemDto(
            Long id,
            String productId,
            String productName,
            String productImageUrl,
            BigDecimal unitPrice,
            int quantity,
            boolean savedForLater,
            LocalDateTime addedAt
    ) {}
}
