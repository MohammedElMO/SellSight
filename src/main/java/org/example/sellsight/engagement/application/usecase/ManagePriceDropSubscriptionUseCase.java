package org.example.sellsight.engagement.application.usecase;

import org.example.sellsight.engagement.infrastructure.persistence.entity.PriceDropSubscriptionJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.repository.PriceDropSubscriptionJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ManagePriceDropSubscriptionUseCase {

    private final PriceDropSubscriptionJpaRepository repo;

    public ManagePriceDropSubscriptionUseCase(PriceDropSubscriptionJpaRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void subscribe(String userId, String productId, BigDecimal targetPrice) {
        var entity = new PriceDropSubscriptionJpaEntity(userId, productId, targetPrice, LocalDateTime.now());
        repo.save(entity);
    }

    @Transactional
    public void unsubscribe(String userId, String productId) {
        repo.deleteByUserIdAndProductId(userId, productId);
    }

    public boolean isSubscribed(String userId, String productId) {
        return repo.existsByUserIdAndProductId(userId, productId);
    }
}
