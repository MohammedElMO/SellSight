package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.infrastructure.persistence.repository.AnalyticsQueryRepository;
import org.example.sellsight.analytics.infrastructure.web.dto.CategorySalesDto;
import org.example.sellsight.analytics.infrastructure.web.dto.ConsumerRecommendationDto;
import org.example.sellsight.analytics.infrastructure.web.dto.CustomerValueDto;
import org.example.sellsight.analytics.infrastructure.web.dto.AnalyticsSummaryDto;
import org.example.sellsight.analytics.infrastructure.web.dto.HistoricalDailySalesDto;
import org.example.sellsight.analytics.infrastructure.web.dto.HistoricalEventFunnelDto;
import org.example.sellsight.analytics.infrastructure.web.dto.InventoryRiskDto;
import org.example.sellsight.analytics.infrastructure.web.dto.MonthlySalesDto;
import org.example.sellsight.analytics.infrastructure.web.dto.SellerPerformanceDto;
import org.example.sellsight.analytics.infrastructure.web.dto.TopProductDto;
import org.example.sellsight.analytics.domain.model.EventType;
import org.example.sellsight.order.domain.model.OrderStatus;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GetAnalyticsSummaryUseCase {

    private final AnalyticsQueryRepository queryRepository;

    public GetAnalyticsSummaryUseCase(AnalyticsQueryRepository queryRepository) {
        this.queryRepository = queryRepository;
    }

    @Cacheable(value = "analytics-summary", key = "'admin-summary'", sync = true)
    public AnalyticsSummaryDto execute() {
        LocalDateTime now = LocalDateTime.now();

        BigDecimal revenueToday = queryRepository.sumRevenueSince(now.toLocalDate().atStartOfDay());
        BigDecimal revenue7d = queryRepository.sumRevenueSince(now.minusDays(7));
        BigDecimal revenue30d = queryRepository.sumRevenueSince(now.minusDays(30));

        Long ordersToday = queryRepository.countOrdersSince(now.toLocalDate().atStartOfDay());
        Long orders7d = queryRepository.countOrdersSince(now.minusDays(7));
        Long orders30d = queryRepository.countOrdersSince(now.minusDays(30));

        Long activeUsersLastHour = queryRepository.countDistinctActiveUsersSince(now.minusHours(1));
        Long activeUsers7d = queryRepository.countDistinctActiveUsersSince(now.minusDays(7));
        Long newUsers7d = queryRepository.countNewUsersSince(now.minusDays(7));
        Long cancelledOrders7d = queryRepository.countOrdersByStatusSince(now.minusDays(7), OrderStatus.CANCELLED);

        Long sessions7d = queryRepository.countDistinctSessionsSince(now.minusDays(7));
        Long purchases7d = queryRepository.countOrdersSince(now.minusDays(7));
        double conversion7d = sessions7d == 0 ? 0.0 : (double) purchases7d / sessions7d;

        Long productViews7d = queryRepository.countEventsSince(now.minusDays(7), EventType.VIEW);
        Long addToCart7d = queryRepository.countEventsSince(now.minusDays(7), EventType.ADD_TO_CART);
        Long purchasesActivity7d = queryRepository.countEventsSince(now.minusDays(7), EventType.PURCHASE);
        double viewToCartRate7d = productViews7d == 0 ? 0.0 : (double) addToCart7d / productViews7d;
        double cartToPurchaseRate7d = addToCart7d == 0 ? 0.0 : (double) purchasesActivity7d / addToCart7d;

        List<ConsumerRecommendationDto> consumerRecommendations = queryRepository.topConsumerRecommendations(now.minusDays(7), 5).stream()
            .map(row -> new ConsumerRecommendationDto(
                    String.valueOf(row[0]),
                    String.valueOf(row[1]),
                    number(row[6]),
                    buildReason(number(row[3]), number(row[4]), number(row[5]))
            ))
            .collect(Collectors.toList());

        BigDecimal averageOrderValue7d = orders7d == 0
            ? BigDecimal.ZERO
            : revenue7d.divide(BigDecimal.valueOf(orders7d), 2, java.math.RoundingMode.HALF_UP);

        List<TopProductDto> topProducts = queryRepository.topProductsByRevenue(now.minusDays(7), 6).stream()
            .map(r -> {
                long views = number(r[5]);
                long purchases = number(r[7]);
                return new TopProductDto(
                        String.valueOf(r[0]),
                        String.valueOf(r[1]),
                        r[2] == null ? null : String.valueOf(r[2]),
                        number(r[3]),
                        money(r[4]),
                        views,
                        number(r[6]),
                        purchases,
                        percentage(purchases, views)
                );
            })
                .collect(Collectors.toList());

        List<HistoricalDailySalesDto> historicalDailySales = queryRepository.historicalDailySales(14).stream()
                .map(r -> new HistoricalDailySalesDto(
                        localDate(r[0]),
                        number(r[1]),
                        money(r[2])
                ))
                .toList();

        List<TopProductDto> historicalTopProducts = queryRepository.historicalTopProducts(8).stream()
                .map(r -> new TopProductDto(
                        String.valueOf(r[0]),
                        String.valueOf(r[1]),
                        r[2] == null ? null : String.valueOf(r[2]),
                        number(r[3]),
                        money(r[4]),
                        0L,
                        0L,
                        0L,
                        0.0
                ))
                .toList();

        List<HistoricalEventFunnelDto> historicalEventFunnel = queryRepository.historicalEventFunnel().stream()
                .map(r -> new HistoricalEventFunnelDto(
                        String.valueOf(r[0]),
                        number(r[1])
                ))
                .toList();

        List<CategorySalesDto> categorySales = queryRepository.categorySales(8).stream()
                .map(r -> new CategorySalesDto(
                        String.valueOf(r[0]),
                        number(r[1]),
                        number(r[2]),
                        money(r[3])
                ))
                .toList();

        List<SellerPerformanceDto> sellerPerformance = queryRepository.sellerPerformance(8).stream()
                .map(r -> new SellerPerformanceDto(
                        String.valueOf(r[0]),
                        r[1] == null ? "Unknown seller" : String.valueOf(r[1]),
                        number(r[2]),
                        number(r[3]),
                        number(r[4]),
                        money(r[5])
                ))
                .toList();

        List<InventoryRiskDto> inventoryRisk = queryRepository.inventoryRisk(10).stream()
                .map(r -> new InventoryRiskDto(
                        String.valueOf(r[0]),
                        r[1] == null ? String.valueOf(r[0]) : String.valueOf(r[1]),
                        r[2] == null ? "Uncategorized" : String.valueOf(r[2]),
                        r[3] == null ? null : String.valueOf(r[3]),
                        number(r[4]),
                        number(r[5]),
                        number(r[6]),
                        number(r[7]),
                        (int) number(r[8])
                ))
                .toList();

        List<MonthlySalesDto> monthlySales = queryRepository.monthlySales(12).stream()
                .map(r -> new MonthlySalesDto(
                        String.valueOf(r[0]),
                        number(r[1]),
                        money(r[2])
                ))
                .toList();

        List<CustomerValueDto> customerValue = queryRepository.customerValue(8).stream()
                .map(r -> new CustomerValueDto(
                        String.valueOf(r[0]),
                        r[1] == null ? "Unknown customer" : String.valueOf(r[1]),
                        r[2] == null ? null : String.valueOf(r[2]),
                        number(r[3]),
                        money(r[4]),
                        r[5] == null ? null : String.valueOf(r[5])
                ))
                .toList();

        return new AnalyticsSummaryDto(
                revenueToday,
                revenue7d,
                revenue30d,
                ordersToday,
                orders7d,
                orders30d,
                activeUsersLastHour,
            activeUsers7d,
            newUsers7d,
            cancelledOrders7d,
            averageOrderValue7d,
                conversion7d,
                productViews7d,
                addToCart7d,
                purchasesActivity7d,
                viewToCartRate7d,
                cartToPurchaseRate7d,
                consumerRecommendations,
                topProducts,
                historicalDailySales,
                historicalTopProducts,
                historicalEventFunnel,
                categorySales,
                sellerPerformance,
                inventoryRisk,
                monthlySales,
                customerValue
        );
    }

    private long number(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private String buildReason(long viewCount, long cartCount, long purchaseCount) {
        if (purchaseCount > 0) {
            return "Customers are buying this product";
        }
        if (cartCount > 0 && cartCount * 2 >= Math.max(viewCount, 1L)) {
            return "High add-to-cart intent";
        }
        if (viewCount > 0) {
            return "Rising product visibility";
        }
        return "Broad engagement signal";
    }

    private BigDecimal money(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    private LocalDate localDate(Object value) {
        if (value instanceof LocalDate date) {
            return date;
        }
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        return LocalDate.parse(String.valueOf(value));
    }

    private double percentage(long numerator, long denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return Math.round(((double) numerator * 10000.0) / denominator) / 100.0;
    }
}
