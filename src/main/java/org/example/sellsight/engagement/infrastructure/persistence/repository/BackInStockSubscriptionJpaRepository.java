package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.BackInStockSubscriptionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackInStockSubscriptionJpaRepository
        extends JpaRepository<BackInStockSubscriptionJpaEntity, BackInStockSubscriptionJpaEntity.PK> {

    boolean existsByUserIdAndProductId(String userId, String productId);

    void deleteByUserIdAndProductId(String userId, String productId);

    List<BackInStockSubscriptionJpaEntity> findByProductId(String productId);

    void deleteByProductId(String productId);
}
