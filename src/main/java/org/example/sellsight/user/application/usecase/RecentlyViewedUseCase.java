package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.usecase.GetProductByIdUseCase;
import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class RecentlyViewedUseCase {

    private static final String KEY_PREFIX = "rv:";
    private static final int MAX_ITEMS = 20;
    private static final Duration TTL = Duration.ofHours(1);

    private final RedisTemplate<String, String> redisTemplate;
    private final GetProductByIdUseCase getProductByIdUseCase;

    public RecentlyViewedUseCase(RedisTemplate<String, String> redisTemplate,
                                  GetProductByIdUseCase getProductByIdUseCase) {
        this.redisTemplate = redisTemplate;
        this.getProductByIdUseCase = getProductByIdUseCase;
    }

    public void record(String userId, String productId) {
        String key = KEY_PREFIX + userId;
        double score = System.currentTimeMillis();
        ZSetOperations<String, String> zset = redisTemplate.opsForZSet();
        zset.add(key, productId, score);
        // Keep only the most recent MAX_ITEMS (remove oldest entries if over limit)
        zset.removeRange(key, 0, -(MAX_ITEMS + 1));
        redisTemplate.expire(key, TTL);
    }

    public List<ProductDto> getRecent(String userId) {
        String key = KEY_PREFIX + userId;
        Set<String> productIds = redisTemplate.opsForZSet()
                .reverseRange(key, 0, MAX_ITEMS - 1);
        if (productIds == null || productIds.isEmpty()) return List.of();

        List<ProductDto> results = new ArrayList<>();
        for (String productId : productIds) {
            try {
                results.add(getProductByIdUseCase.execute(productId));
            } catch (ProductNotFoundException e) {
                // product deleted — silently skip and remove from Redis
                redisTemplate.opsForZSet().remove(key, productId);
            }
        }
        return results;
    }
}
