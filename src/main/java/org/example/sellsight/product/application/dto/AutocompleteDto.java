package org.example.sellsight.product.application.dto;

import java.math.BigDecimal;

public record AutocompleteDto(
        String id,
        String name,
        String category,
        String imageUrl,
        BigDecimal price
) {}
