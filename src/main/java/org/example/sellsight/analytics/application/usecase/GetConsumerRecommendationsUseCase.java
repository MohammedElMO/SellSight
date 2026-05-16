package org.example.sellsight.analytics.application.usecase;

import org.example.sellsight.analytics.infrastructure.persistence.repository.AnalyticsQueryRepository;
import org.example.sellsight.analytics.infrastructure.web.dto.ConsumerRecommendationDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GetConsumerRecommendationsUseCase {

    private final AnalyticsQueryRepository queryRepository;

    public GetConsumerRecommendationsUseCase(AnalyticsQueryRepository queryRepository) {
        this.queryRepository = queryRepository;
    }

    @Cacheable(value = "consumer-recommendations", key = "'customer-home'", sync = true)
    public List<ConsumerRecommendationDto> execute() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);

        return queryRepository.topConsumerRecommendations(since, 5).stream()
                .map(row -> new ConsumerRecommendationDto(
                        String.valueOf(row[0]),
                        String.valueOf(row[1]),
                        number(row[6]),
                        buildReason(number(row[3]), number(row[4]), number(row[5]))
                ))
                .collect(Collectors.toList());
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
}