package org.example.sellsight.loyalty.infrastructure.persistence.repository;

import org.example.sellsight.loyalty.infrastructure.persistence.entity.LoyaltyAccountJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyAccountJpaRepository extends JpaRepository<LoyaltyAccountJpaEntity, String> {
    Optional<LoyaltyAccountJpaEntity> findByReferralCode(String code);
}
