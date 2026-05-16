package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.infrastructure.persistence.repository.AnalyticsQueryRepository;
import org.example.sellsight.analytics.infrastructure.web.dto.SellerAnalyticsDto;
import org.example.sellsight.analytics.infrastructure.web.dto.SellerProductAnalyticsDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class GetSellerAnalyticsUseCase {

    private final AnalyticsQueryRepository queryRepository;

    public GetSellerAnalyticsUseCase(AnalyticsQueryRepository queryRepository) {
        this.queryRepository = queryRepository;
    }

    @Cacheable(value = "seller-analytics", key = "#sellerId + ':' + #days", sync = true)
    public SellerAnalyticsDto execute(String sellerId, int days) {
        int boundedDays = Math.max(1, Math.min(days, 90));
        LocalDateTime since = LocalDateTime.now().minusDays(boundedDays);

        List<SellerProductAnalyticsDto> products = queryRepository.sellerProductAnalytics(sellerId, since).stream()
                .map(row -> {
                    long views = number(row[4]);
                    long carts = number(row[5]);
                    long purchases = number(row[6]);
                    return new SellerProductAnalyticsDto(
                            String.valueOf(row[0]),
                            String.valueOf(row[1]),
                            row[2] == null ? null : String.valueOf(row[2]),
                            Boolean.TRUE.equals(row[3]),
                            views,
                            carts,
                            purchases,
                            rate(carts, views),
                            rate(purchases, views)
                    );
                })
                .toList();

        long totalViews = products.stream().mapToLong(SellerProductAnalyticsDto::views).sum();
        long totalCarts = products.stream().mapToLong(SellerProductAnalyticsDto::addToCarts).sum();
        long totalPurchases = products.stream().mapToLong(SellerProductAnalyticsDto::purchases).sum();

        return new SellerAnalyticsDto(
                boundedDays,
                totalViews,
                totalCarts,
                totalPurchases,
                rate(totalCarts, totalViews),
                rate(totalPurchases, totalViews),
                products
        );
    }

    private long number(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return 0L;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private double rate(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0.0;
        }
        return Math.round((numerator * 10000.0 / denominator)) / 100.0;
    }
}
