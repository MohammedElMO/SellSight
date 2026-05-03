package org.example.sellsight.order.application.dto;

import java.math.BigDecimal;

public record OrderItemDto(
        String productId,
        String productName,
        String sellerId,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}
