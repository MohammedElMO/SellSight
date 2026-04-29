package org.example.sellsight.analytics.application.dto;

public record SellerTopProductDto(
        Long productId,
        String name,
        Double popularityScore,
        Long views,
        Long addToCart
) {
}
