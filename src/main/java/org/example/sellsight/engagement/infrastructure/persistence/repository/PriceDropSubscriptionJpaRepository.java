package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.PriceDropSubscriptionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceDropSubscriptionJpaRepository
        extends JpaRepository<PriceDropSubscriptionJpaEntity, PriceDropSubscriptionJpaEntity.PK> {

    boolean existsByUserIdAndProductId(String userId, String productId);

    void deleteByUserIdAndProductId(String userId, String productId);
}
