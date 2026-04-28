package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.application.dto.AnalyticsProductScoreDto;
import org.example.sellsight.analytics.application.dto.RecommendationDto;
import org.example.sellsight.analytics.application.dto.SellerAnalyticsSummaryDto;
import org.example.sellsight.analytics.infrastructure.persistence.repository.AnalyticsServingRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class GetAnalyticsServingUseCase {

    private final AnalyticsServingRepository analyticsServingRepository;

    public GetAnalyticsServingUseCase(AnalyticsServingRepository analyticsServingRepository) {
        this.analyticsServingRepository = analyticsServingRepository;
    }

    public List<AnalyticsProductScoreDto> getTrendingProducts(int limit) {
        return analyticsServingRepository.findTopTrendingProducts(limit);
    }

    public Optional<SellerAnalyticsSummaryDto> getSellerSummary(String sellerId) {
        return analyticsServingRepository.findSellerSummary(sellerId);
    }

    public List<AnalyticsProductScoreDto> getSellerTopProducts(String sellerId, int limit) {
        return analyticsServingRepository.findTopProductsBySeller(sellerId, limit);
    }

    public List<RecommendationDto> getUserRecommendations(String userId, int limit) {
        return analyticsServingRepository.findRecommendationsForUser(userId, limit);
    }
}
