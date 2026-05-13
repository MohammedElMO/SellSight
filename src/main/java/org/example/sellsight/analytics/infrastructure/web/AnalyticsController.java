package org.example.sellsight.analytics.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.analytics.application.usecase.GetAnalyticsSummaryUseCase;
import org.example.sellsight.analytics.application.usecase.GetSellerAnalyticsUseCase;
import org.example.sellsight.analytics.infrastructure.web.dto.AnalyticsSummaryDto;
import org.example.sellsight.analytics.infrastructure.web.dto.SellerAnalyticsDto;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Analytics", description = "Aggregated platform analytics for admin")
@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final GetAnalyticsSummaryUseCase getAnalyticsSummaryUseCase;
    private final GetSellerAnalyticsUseCase getSellerAnalyticsUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public AnalyticsController(GetAnalyticsSummaryUseCase getAnalyticsSummaryUseCase,
                               GetSellerAnalyticsUseCase getSellerAnalyticsUseCase,
                               GetUserProfileUseCase getUserProfileUseCase) {
        this.getAnalyticsSummaryUseCase = getAnalyticsSummaryUseCase;
        this.getSellerAnalyticsUseCase = getSellerAnalyticsUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getAnalyticsSummary", summary = "Get aggregated analytics summary")
    @GetMapping("/admin/analytics/summary")
    public ResponseEntity<AnalyticsSummaryDto> summary() {
        AnalyticsSummaryDto dto = getAnalyticsSummaryUseCase.execute();
        return ResponseEntity.ok(dto);
    }

    @Operation(operationId = "getSellerAnalytics", summary = "Get product analytics for the authenticated seller")
    @GetMapping("/seller/analytics/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerAnalyticsDto> sellerAnalytics(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        UserDto seller = getUserProfileUseCase.execute(authentication.getName());
        return ResponseEntity.ok(getSellerAnalyticsUseCase.execute(seller.id(), days));
    }
}
