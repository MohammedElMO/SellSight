package org.example.sellsight.analytics.infrastructure.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsSummaryDto(
        BigDecimal revenueToday,
        BigDecimal revenue7d,
        BigDecimal revenue30d,
        Long ordersToday,
        Long orders7d,
        Long orders30d,
        Long activeUsersLastHour,
        Long activeUsers7d,
        Long newUsers7d,
        Long cancelledOrders7d,
        BigDecimal averageOrderValue7d,
        double conversion7d,
        Long productViews7d,
        Long addToCart7d,
        Long purchases7d,
        double viewToCartRate7d,
        double cartToPurchaseRate7d,
        List<ConsumerRecommendationDto> consumerRecommendations,
        List<TopProductDto> topProducts,
        List<HistoricalDailySalesDto> historicalDailySales,
        List<TopProductDto> historicalTopProducts,
        List<HistoricalEventFunnelDto> historicalEventFunnel,
        List<CategorySalesDto> categorySales,
        List<SellerPerformanceDto> sellerPerformance,
        List<InventoryRiskDto> inventoryRisk,
        List<MonthlySalesDto> monthlySales,
        List<CustomerValueDto> customerValue
) {}
