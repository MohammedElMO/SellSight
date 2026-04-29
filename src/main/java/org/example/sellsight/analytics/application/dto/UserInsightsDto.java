package org.example.sellsight.analytics.application.dto;

public record UserInsightsDto(
        Long productsViews,
        Long productsCarted,
        Long productsPurchased,
        Double avgRating
) {
}
