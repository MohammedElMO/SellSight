package org.example.sellsight.loyalty.infrastructure.persistence.repository;

import org.example.sellsight.loyalty.infrastructure.persistence.entity.LoyaltyTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionJpaRepository extends JpaRepository<LoyaltyTransactionJpaEntity, UUID> {
    List<LoyaltyTransactionJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
