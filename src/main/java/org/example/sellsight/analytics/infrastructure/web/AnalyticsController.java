package org.example.sellsight.analytics.infrastructure.web;

import org.example.sellsight.analytics.application.dto.AnalyticsProductScoreDto;
import org.example.sellsight.analytics.application.dto.RecommendationDto;
import org.example.sellsight.analytics.application.dto.SellerAnalyticsSummaryDto;
import org.example.sellsight.analytics.application.usecase.GetAnalyticsServingUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final GetAnalyticsServingUseCase getAnalyticsServingUseCase;

    public AnalyticsController(GetAnalyticsServingUseCase getAnalyticsServingUseCase) {
        this.getAnalyticsServingUseCase = getAnalyticsServingUseCase;
    }

    @GetMapping("/trending-products")
    public ResponseEntity<List<AnalyticsProductScoreDto>> trendingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(getAnalyticsServingUseCase.getTrendingProducts(limit));
    }

    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<SellerAnalyticsSummaryDto> sellerSummary(@PathVariable String sellerId) {
        return ResponseEntity.of(getAnalyticsServingUseCase.getSellerSummary(sellerId));
    }

    @GetMapping("/sellers/{sellerId}/products")
    public ResponseEntity<List<AnalyticsProductScoreDto>> sellerTopProducts(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(getAnalyticsServingUseCase.getSellerTopProducts(sellerId, limit));
    }

    @GetMapping("/users/{userId}/recommendations")
    public ResponseEntity<List<RecommendationDto>> recommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(getAnalyticsServingUseCase.getUserRecommendations(userId, limit));
    }
}
