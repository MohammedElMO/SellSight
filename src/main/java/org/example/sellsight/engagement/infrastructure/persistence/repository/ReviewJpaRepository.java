package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.infrastructure.persistence.entity.ReviewJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewJpaRepository extends JpaRepository<ReviewJpaEntity, UUID> {
    List<ReviewJpaEntity> findByProductIdOrderByCreatedAtDesc(String productId);
    Optional<ReviewJpaEntity> findByProductIdAndCustomerId(String productId, String customerId);
    boolean existsByProductIdAndCustomerId(String productId, String customerId);
}
