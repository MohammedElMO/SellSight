package org.example.sellsight.product.application.dto;

import java.util.List;

public record LandingDto(
        List<ProductDto> popular,
        List<ProductDto> newArrivals,
        List<ProductDto> trending
) {}
