package org.example.sellsight.promotions.infrastructure.persistence.repository;

import org.example.sellsight.promotions.infrastructure.persistence.entity.CouponJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponJpaRepository extends JpaRepository<CouponJpaEntity, UUID> {
    Optional<CouponJpaEntity> findByCode(String code);
}
