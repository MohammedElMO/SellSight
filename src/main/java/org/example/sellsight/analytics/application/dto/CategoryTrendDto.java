package org.example.sellsight.analytics.application.dto;

public record CategoryTrendDto(
        String category,
        Double avgScore,
        Long totalViews
) {
}
