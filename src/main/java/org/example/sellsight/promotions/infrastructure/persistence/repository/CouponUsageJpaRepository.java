package org.example.sellsight.promotions.infrastructure.persistence.repository;

import org.example.sellsight.promotions.infrastructure.persistence.entity.CouponUsageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageJpaRepository extends JpaRepository<CouponUsageJpaEntity, Long> {
}
